import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, TrendingUp, Calendar, Plus, LayoutDashboard, Coins, Tags, Sparkles, FileText } from 'lucide-react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import SourceManager, { getSourceIcon } from './SourceManager';
import CategoryManager from './CategoryManager';
import Reports from './Reports';

const EXPENSES_URL = import.meta.env.VITE_API_URL + '/expenses';
const SOURCES_URL = import.meta.env.VITE_API_URL + '/sources';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [sources, setSources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'reports', 'sources', 'categories'

  const fetchData = async () => {
    try {
      const [expensesRes, sourcesRes] = await Promise.all([
        axios.get(EXPENSES_URL),
        axios.get(SOURCES_URL)
      ]);
      setExpenses(expensesRes.data);
      setSources(sourcesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === new Date().getMonth() && expDate.getFullYear() === new Date().getFullYear();
  }).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-28">
      {/* Header */}
      <header className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto flex justify-between items-center border-b border-slate-900/60 mb-6 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-1.5">
            House <span className="text-indigo-500">Expenses</span>
            <Sparkles className="text-yellow-400 w-5 h-5 animate-pulse" />
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Smart tracking for your house project in Kerala</p>
        </div>
        <div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-600/10 active:scale-95 transition-all sm:px-6 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="px-4 sm:px-6 max-w-6xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left side: Stats and Transactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-850 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden group">
                  <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-28 h-28 sm:w-32 sm:h-32 transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                  <p className="text-indigo-100 text-sm font-medium mb-1">Total Project Spending</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">${totalAmount.toFixed(2)}</h2>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md">
                    <TrendingUp size={12} />
                    Overall Cost
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl relative overflow-hidden transition-all hover:border-slate-700">
                  <Calendar className="absolute -right-4 -bottom-4 text-slate-800/60 w-28 h-28 sm:w-32 sm:h-32 transform rotate-12" />
                  <p className="text-slate-400 text-sm font-medium mb-1">{currentMonth} Spending</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">${monthlyExpenses.toFixed(2)}</h2>
                  <p className="mt-4 text-slate-500 text-xs sm:text-sm">Target: Maintain within budget</p>
                </div>
              </div>

              {/* Transactions List */}
              {loading ? (
                <div className="flex justify-center mt-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <ExpenseList expenses={expenses} onExpenseDeleted={fetchData} />
              )}
            </div>

            {/* Right side: Funding Sources Overview */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-xl">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Funding Summary</h3>
                {sources.length === 0 ? (
                  <p className="text-slate-500 text-xs sm:text-sm">No funding sources configured yet.</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {sources.map(source => (
                      <div key={source.id} className="p-3.5 sm:p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex-shrink-0">
                              {getSourceIcon(source.type)}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white text-xs sm:text-sm truncate" title={source.name}>{source.name}</h4>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                                {source.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {source.type !== 'Person' ? (
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 mb-1">
                              <span>Remaining</span>
                              <span className={source.remainingBalance < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                ${parseFloat(source.remainingBalance || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${source.remainingBalance < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, (parseFloat(source.totalSpent || 0) / parseFloat(source.totalAmount || 1)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                              <span>Spent: ${parseFloat(source.totalSpent || 0).toFixed(2)}</span>
                              <span>Total: ${parseFloat(source.totalAmount || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 flex justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                            <span className="text-[10px] sm:text-xs text-slate-550">Contributed:</span>
                            <span className="text-xs sm:text-sm font-bold text-indigo-400">
                              ${parseFloat(source.totalSpent || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <Reports />
        )}

        {activeTab === 'sources' && (
          <SourceManager />
        )}

        {activeTab === 'categories' && (
          <CategoryManager />
        )}
      </main>

      {/* Floating Action Button (Mobile) - Visible on Home & Reports */}
      {(activeTab === 'dashboard' || activeTab === 'reports') && (
        <button 
          onClick={() => setShowForm(true)}
          className="md:hidden fixed bottom-24 right-6 bg-indigo-600 text-white p-4.5 rounded-full shadow-2xl shadow-indigo-600/40 z-40 active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Mobile-Native Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 px-4 py-2 pb-safe z-40 flex justify-around items-center no-print">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all py-1 px-3 rounded-xl ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all py-1 px-3 rounded-xl ${
            activeTab === 'reports' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText className="w-5 h-5" />
          Reports
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all py-1 px-3 rounded-xl ${
            activeTab === 'sources' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Coins className="w-5 h-5" />
          Sources
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all py-1 px-3 rounded-xl ${
            activeTab === 'categories' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Tags className="w-5 h-5" />
          Categories
        </button>
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm 
          onExpenseAdded={fetchData} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
