import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Printer, Building2, Coins, Wallet, Download, Calendar, ArrowDownCircle, Plus, Minus } from 'lucide-react';
import { getIconComponent, getSourceIcon } from './iconUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXPENSES_URL = '/expenses';
const SOURCES_URL = '/sources';

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'month', '30days'
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (catName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, sourcesRes] = await Promise.all([
          api.get(EXPENSES_URL),
          api.get(SOURCES_URL)
        ]);
        setExpenses(expensesRes.data);
        setSources(sourcesRes.data);
        if (sourcesRes.data.length > 0) {
          setSelectedSourceId(sourcesRes.data[0].id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading reports data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Date Filtering Logic
  const getFilteredExpenses = () => {
    const activeExpenses = expenses.filter(exp => exp.status !== 'Cancelled');
    if (dateFilter === 'all') return activeExpenses;
    const now = new Date();
    return activeExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      if (dateFilter === 'month') {
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === '30days') {
        const diffTime = Math.abs(now - expDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();
  const overallSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // 2. Budget Utilization (Loans + Asset Sales)
  const budgetSources = sources.filter(s => s.type !== 'Person');
  const totalBudget = budgetSources.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);
  const totalSpentFromBudget = budgetSources.reduce((sum, s) => sum + parseFloat(s.totalSpent || 0), 0);
  const budgetUtilizationPercent = totalBudget > 0 ? (totalSpentFromBudget / totalBudget) * 100 : 0;

  // 3. Category Expenses Breakdown
  const categorySummary = {};
  filteredExpenses.forEach(exp => {
    const catName = exp.category?.name || 'Uncategorized';
    const catIcon = exp.category?.icon || 'Folder';
    if (!categorySummary[catName]) {
      categorySummary[catName] = { name: catName, icon: catIcon, amount: 0 };
    }
    categorySummary[catName].amount += parseFloat(exp.amount);
  });

  const categoryBreakdown = Object.values(categorySummary).sort((a, b) => b.amount - a.amount);

  // 4. Statement of Account (SOA) Ledger for Selected Source
  const selectedSource = sources.find(s => s.id === selectedSourceId);
  const sourceExpenses = expenses
    .filter(exp => exp.sourceId === selectedSourceId && exp.status !== 'Cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Chronological order for ledger

  // Calculate Running Balance / Cumulative contributions
  let runningBalance = selectedSource?.type !== 'Person' ? parseFloat(selectedSource?.totalAmount || 0) : 0;
  const ledgerItems = sourceExpenses.map(exp => {
    const amount = parseFloat(exp.amount);
    if (selectedSource?.type !== 'Person') {
      runningBalance -= amount;
    } else {
      runningBalance += amount; // For Person, count total contribution going up
    }
    return {
      ...exp,
      runningBalance
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const generateProjectReportPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [79, 70, 229]; // Indigo hex #4f46e5
    const textColor = [15, 23, 42]; // Slate 900 hex #0f172a
    const mutedTextColor = [100, 116, 139]; // Slate 500 hex #64748b

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PROJECT EXPENDITURE REPORT', 14, 22);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('HOUSE CONSTRUCTION PROJECT (KERALA)', 14, 28);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.setFont('helvetica', 'bold');
    doc.text('Report Scope:', 14, 42);
    doc.setFont('helvetica', 'normal');
    const dateText = dateFilter === 'all' ? 'All Time Expenses' : dateFilter === 'month' ? 'This Month Expenses' : 'Last 30 Days Expenses';
    doc.text(dateText, 42, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Date Exported:', 120, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().toLocaleString()}`, 150, 42);

    // Summary Metrics Box (4-column layout)
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 48, 182, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 48, 182, 22, 'S');

    doc.setFontSize(7.5);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('TOTAL PROJECT EXPENSE', 18, 54);
    doc.text('TOTAL CAPITAL LIMIT', 66, 54);
    doc.text('SPENT FROM CAPITAL', 112, 54);
    doc.text('REMAINING BALANCE', 156, 54);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`INR ${overallSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18, 63);
    doc.text(`INR ${totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 66, 63);
    doc.text(`INR ${totalSpentFromBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 112, 63);

    const remainingBudget = totalBudget - totalSpentFromBudget;
    if (remainingBudget < 0) {
      doc.setTextColor(239, 68, 68);
    } else {
      doc.setTextColor(16, 185, 129);
    }
    doc.text(`INR ${remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 156, 63);

    // Show Capital consumption info
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Consolidated Capital Utilization: ${budgetUtilizationPercent.toFixed(1)}% Consumed`, 14, 76);

    // Category Breakdown Table
    const breakdownHeaders = [['Stage/Category Description', 'Amount Spent', 'Percentage of Total']];
    const breakdownRows = [];

    categoryBreakdown.forEach(cat => {
      const percentage = overallSpent > 0 ? (cat.amount / overallSpent) * 100 : 0;
      
      // Main category row
      breakdownRows.push([
        { 
          content: cat.name.toUpperCase(), 
          styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [79, 70, 229] } 
        },
        { 
          content: `INR ${cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
          styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'right' } 
        },
        { 
          content: `${percentage.toFixed(1)}%`, 
          styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'right' } 
        }
      ]);

      // Nested transactions under this category
      const catExpenses = filteredExpenses.filter(
        exp => (exp.category?.name || 'Uncategorized') === cat.name
      );

      catExpenses.forEach(exp => {
        const dateStr = new Date(exp.date).toLocaleDateString();
        const detailStr = `   •  ${dateStr}: ${exp.title}${exp.description ? ` (${exp.description})` : ''}`;
        breakdownRows.push([
          { 
            content: detailStr, 
            styles: { textColor: [71, 85, 105], fontSize: 8.5 } 
          },
          { 
            content: `INR ${parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            styles: { textColor: [71, 85, 105], fontSize: 8.5, halign: 'right' } 
          },
          { 
            content: '', 
            styles: { fillColor: [255, 255, 255] } 
          }
        ]);
      });
    });

    if (categoryBreakdown.length === 0) {
      breakdownRows.push(['No expenses recorded in this date filter scope', '-', '-']);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Stage-Wise Category Distribution Breakdown', 14, 86);

    autoTable(doc, {
      startY: 90,
      head: breakdownHeaders,
      body: breakdownRows,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 42, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const str = "Page " + doc.internal.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text("Generated by House Expense Tracker", doc.internal.pageSize.width - data.settings.margin.right - 55, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`Project_Expenditure_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const generateSourceLedgerPDF = () => {
    if (!selectedSource) return;

    const doc = new jsPDF();
    const primaryColor = [79, 70, 229]; // Indigo hex #4f46e5
    const textColor = [15, 23, 42]; // Slate 900 hex #0f172a
    const mutedTextColor = [100, 116, 139]; // Slate 500 hex #64748b

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('STATEMENT OF ACCOUNT LEDGER', 14, 22);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('HOUSE CONSTRUCTION PROJECT (KERALA)', 14, 28);

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Meta Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.setFont('helvetica', 'bold');
    doc.text('Source Name:', 14, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedSource.name}`, 42, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Source Type:', 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedSource.type}`, 42, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('Date Exported:', 120, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().toLocaleString()}`, 150, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Date Filter:', 120, 48);
    doc.setFont('helvetica', 'normal');
    const dateText = dateFilter === 'all' ? 'All Time' : dateFilter === 'month' ? 'This Month' : 'Last 30 Days';
    doc.text(dateText, 150, 48);

    // Highlight summary box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 55, 182, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 55, 182, 22, 'S');

    doc.setFontSize(9);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);

    if (selectedSource.type === 'Person') {
      doc.text('TOTAL SPENT', 20, 61);
      doc.text('TOTAL LEDGER ITEMS', 80, 61);
      doc.text('SOURCE TYPE', 140, 61);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`INR ${parseFloat(selectedSource.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 70);
      doc.text(`${ledgerItems.length}`, 80, 70);
      doc.setTextColor(79, 70, 229);
      doc.text('Personal Contrib.', 140, 70);
    } else {
      doc.text('INITIAL CREDIT LIMIT', 20, 61);
      doc.text('TOTAL DEBIT (SPENT)', 80, 61);
      doc.text('CURRENT REMAINING BALANCE', 140, 61);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`INR ${parseFloat(selectedSource.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 70);
      doc.text(`INR ${parseFloat(selectedSource.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 80, 70);

      const balance = parseFloat(selectedSource.remainingBalance || 0);
      if (balance < 0) {
        doc.setTextColor(239, 68, 68);
      } else {
        doc.setTextColor(16, 185, 129);
      }
      doc.text(`INR ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, 70);
    }

    // Transactions list table headers and body
    const tableHeaders = [['Date', 'Transaction Details / Category', 'Debit (Spent)', 'Running Balance']];
    const tableRows = [];

    if (selectedSource.type !== 'Person') {
      tableRows.push([
        'Opening',
        'Initial funding ledger credit limit',
        '-',
        `INR ${parseFloat(selectedSource.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
    }

    ledgerItems.forEach(item => {
      tableRows.push([
        new Date(item.date).toLocaleDateString(),
        `${item.title}\nCategory: ${item.category?.name || 'General'}${item.description ? ` | Desc: ${item.description}` : ''}`,
        `INR ${parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `INR ${parseFloat(item.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
    });

    autoTable(doc, {
      startY: 85,
      head: tableHeaders,
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 95 },
        2: { cellWidth: 32, halign: 'right' },
        3: { cellWidth: 32, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const str = "Page " + doc.internal.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text("Generated by House Expense Tracker", doc.internal.pageSize.width - data.settings.margin.right - 55, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`SOA_Ledger_${selectedSource.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 no-print">
        <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'month' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === '30days' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={generateProjectReportPDF}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Download size={16} /> Export PDF Report
          </button>
          <button
            onClick={generateSourceLedgerPDF}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <FileText size={16} /> Export PDF Ledger
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800 text-slate-300 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={16} /> Print View
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Statement of Account (SOA) & Budget Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Print Header (Only visible in Print layout) */}
            <div className="hidden print-only bg-white text-black p-6 rounded-none border-b-2 border-black mb-6">
              <h1 className="text-3xl font-bold uppercase tracking-wide">Statement of Account</h1>
              <p className="text-sm mt-1">Project: House Construction (Kerala)</p>
              <p className="text-sm">Source: {selectedSource?.name} ({selectedSource?.type})</p>
              <p className="text-sm">Date Run: {new Date().toLocaleString()}</p>
            </div>

            {/* Budget utilization meter */}
            {totalBudget > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl no-print">
                <h3 className="text-lg font-bold text-white mb-2">Total Capital Consumption</h3>
                <p className="text-slate-500 text-xs mb-4">Consolidated Loans and Asset Sale limits</p>
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Spent: ₹{totalSpentFromBudget.toFixed(2)}</span>
                  <span>Total Capital: ₹{totalBudget.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      budgetUtilizationPercent > 90 ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetUtilizationPercent)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>{budgetUtilizationPercent.toFixed(1)}% Consumed</span>
                  <span>Remaining: ₹{(totalBudget - totalSpentFromBudget).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* SOA Ledger Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl print:border-none print:bg-white print:text-black print:p-0">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 no-print">
                <div>
                  <h3 className="text-xl font-bold text-white">Statement of Account (SOA)</h3>
                  <p className="text-slate-500 text-xs mt-1">Select a funding channel to view detailed ledger transaction lines</p>
                </div>
                {sources.length > 0 && (
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm max-w-xs"
                  >
                    {sources.map(src => (
                      <option key={src.id} value={src.id}>{src.name} ({src.type})</option>
                    ))}
                  </select>
                )}
              </div>

              {!selectedSource ? (
                <p className="text-slate-500 text-center py-12 no-print">Please configure a funding source first.</p>
              ) : (
                <div className="space-y-6">
                  {/* Ledger Metrics Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl print:border print:bg-slate-100 print:text-black">
                    <div>
                      <span className="block text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-bold print:text-slate-600">
                        {selectedSource.type === 'Person' ? 'Total Spent' : 'Initial Credit'}
                      </span>
                      <span className="text-sm sm:text-lg font-bold text-white print:text-black">
                        ₹{selectedSource.type === 'Person'
                          ? parseFloat(selectedSource.totalSpent || 0).toFixed(2)
                          : parseFloat(selectedSource.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-bold print:text-slate-600">
                        {selectedSource.type === 'Person' ? 'Ledger Items' : 'Total Spent'}
                      </span>
                      <span className="text-sm sm:text-lg font-bold text-white print:text-black">
                        {selectedSource.type === 'Person'
                          ? ledgerItems.length
                          : `₹${parseFloat(selectedSource.totalSpent || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-bold print:text-slate-600">
                        {selectedSource.type === 'Person' ? 'Type' : 'Current Balance'}
                      </span>
                      <span className={`text-sm sm:text-lg font-bold ${
                        selectedSource.type === 'Person'
                          ? 'text-indigo-400 print:text-indigo-700'
                          : (selectedSource.remainingBalance < 0 ? 'text-red-400 print:text-red-700' : 'text-emerald-400 print:text-emerald-700')
                      }`}>
                        {selectedSource.type === 'Person'
                          ? 'Personal Contrib.'
                          : `₹${parseFloat(selectedSource.remainingBalance || 0).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Ledger Tables */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 print:border-b-2 print:border-black print:text-black">
                          <th className="py-3 px-2">Date</th>
                          <th className="py-3 px-2">Transaction Details</th>
                          <th className="py-3 px-2 text-right">Debit (Spent)</th>
                          <th className="py-3 px-2 text-right">
                            {selectedSource.type === 'Person' ? 'Contribution Total' : 'Running Balance'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSource.type !== 'Person' && (
                          <tr className="border-b border-slate-900/40 text-slate-500 print:border-b print:text-black">
                            <td className="py-3 px-2 font-medium">Opening</td>
                            <td className="py-3 px-2">Initial funding ledger credit</td>
                            <td className="py-3 px-2 text-right">-</td>
                            <td className="py-3 px-2 text-right font-semibold text-white print:text-black">
                              ₹{parseFloat(selectedSource.totalAmount || 0).toFixed(2)}
                            </td>
                          </tr>
                        )}
                        {ledgerItems.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-8 text-slate-500 print:text-slate-700">
                              No transactions recorded for this source.
                            </td>
                          </tr>
                        ) : (
                          ledgerItems.map(item => (
                            <tr key={item.id} className="border-b border-slate-905/30 hover:bg-slate-950/20 print:border-b print:text-black">
                              <td className="py-3 px-2 text-[11px] sm:text-xs">
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-semibold text-white print:text-black">{item.title}</div>
                                <div className="text-[10px] text-slate-500 print:text-slate-600">
                                  {item.category?.name || 'General'} {item.description ? `• ${item.description}` : ''}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right text-red-400 font-medium print:text-black">
                                -₹{parseFloat(item.amount).toFixed(2)}
                              </td>
                              <td className="py-3 px-2 text-right font-semibold text-white print:text-black">
                                ₹{parseFloat(item.runningBalance).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Category Distribution */}
          <div className="space-y-6 no-print">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">Category Breakdown</h3>
              <p className="text-slate-500 text-xs mb-4">Distribution of project expenses by construction stage. Click a category to expand details.</p>

              {/* Total Project Expense metric */}
              <div className="mb-6 p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center">
                <span className="text-slate-400 text-xs font-semibold">Total Project Expense:</span>
                <span className="text-lg font-bold text-indigo-400">₹{overallSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {categoryBreakdown.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-sm">No expenses recorded for this selection.</p>
              ) : (
                <div className="space-y-5">
                  {categoryBreakdown.map(cat => {
                    const percentage = overallSpent > 0 ? (cat.amount / overallSpent) * 100 : 0;
                    const isExpanded = !!expandedCategories[cat.name];
                    const catExpenses = filteredExpenses.filter(
                      exp => (exp.category?.name || 'Uncategorized') === cat.name
                    );

                    return (
                      <div key={cat.name} className="space-y-2">
                        <div 
                          onClick={() => toggleCategory(cat.name)}
                          className="flex justify-between items-center text-xs cursor-pointer group hover:bg-slate-800/40 p-2 -mx-2 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-indigo-400 w-4 h-4 flex-shrink-0">
                              {getIconComponent(cat.icon)}
                            </span>
                            <span className="font-semibold text-slate-300 truncate group-hover:text-white" title={cat.name}>
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-500 flex-shrink-0">
                              {isExpanded ? <Minus size={10} /> : <Plus size={10} />}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-bold text-white">₹{cat.amount.toFixed(2)}</span>
                            <span className="text-slate-500 text-[10px] block font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>

                        {/* Collapsible Expense Details */}
                        {isExpanded && (
                          <div className="pl-6 pt-1.5 pb-2 space-y-1.5 border-l-2 border-slate-800/80 ml-2 text-[11px] text-slate-400">
                            {catExpenses.length === 0 ? (
                              <div className="text-[10px] text-slate-500">No transactions under this filter.</div>
                            ) : (
                              catExpenses.map(exp => (
                                <div key={exp.id} className="flex justify-between items-start gap-2 py-0.5 hover:text-white transition-colors">
                                  <div className="min-w-0">
                                    <span className="text-[9px] text-slate-500 mr-2">{new Date(exp.date).toLocaleDateString()}</span>
                                    <span className="font-medium text-slate-300">{exp.title}</span>
                                    {exp.description && (
                                      <span className="text-[9px] text-slate-500 block">{exp.description}</span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-slate-400 flex-shrink-0">₹{parseFloat(exp.amount).toFixed(2)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
