import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Printer, Building2, Coins, Wallet, Download, Calendar, ArrowDownCircle } from 'lucide-react';
import { getIconComponent, getSourceIcon } from './iconUtils';

const EXPENSES_URL = '/expenses';
const SOURCES_URL = '/sources';

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'month', '30days'

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

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Printer size={16} /> Print SOA Ledger
        </button>
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
              <p className="text-slate-500 text-xs mb-6">Distribution of project expenses by construction stage</p>

              {categoryBreakdown.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-sm">No expenses recorded for this selection.</p>
              ) : (
                <div className="space-y-5">
                  {categoryBreakdown.map(cat => {
                    const percentage = overallSpent > 0 ? (cat.amount / overallSpent) * 100 : 0;
                    return (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-indigo-400 w-4 h-4 flex-shrink-0">
                              {getIconComponent(cat.icon)}
                            </span>
                            <span className="font-semibold text-slate-300 truncate" title={cat.name}>
                              {cat.name}
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
