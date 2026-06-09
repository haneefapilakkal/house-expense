import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, TrendingUp, Calendar, Plus, LayoutDashboard, Coins, Tags, Sparkles } from 'lucide-react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import SourceManager, { getSourceIcon } from './SourceManager';
import CategoryManager from './CategoryManager';

const EXPENSES_URL = import.meta.env.VITE_API_URL + '/expenses';
const SOURCES_URL = import.meta.env.VITE_API_URL + '/sources';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [sources, setSources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'sources', 'categories'

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
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24">
      {/* Header */}
      <header className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            House <span className="text-indigo-500">Expenses</span>
            <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse" />
          </h1>
          <p className="text-slate-500 mt-1">Smart funding & category tracking for your home project in Kerala</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowForm(true)}
            className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all px-6 flex items-center justify-center gap-2 font-semibold"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      {/* Tabs / Navigation */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800/80 max-w-sm sm:max-w-md">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'sources'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Sources
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tags className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Categories
          </button>
        </div>
      </div>

      <main className="px-6 max-w-6xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Stats and Transactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-850 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                  <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                  <p className="text-indigo-100 font-medium mb-1">Total Project Spending</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white">${totalAmount.toFixed(2)}</h2>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                    <TrendingUp size={14} />
                    Overall Cost
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden transition-all hover:border-slate-700">
                  <Calendar className="absolute -right-4 -bottom-4 text-slate-800 w-32 h-32 transform rotate-12" />
                  <p className="text-slate-400 font-medium mb-1">{currentMonth} Spending</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white">${monthlyExpenses.toFixed(2)}</h2>
                  <p className="mt-4 text-slate-500 text-sm">Target: Maintain within budget</p>
                </div>
              </div>

              {/* Transactions List */}
              {loading ? (
                <div className="flex justify-center mt-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <ExpenseList expenses={expenses} onExpenseDeleted={fetchData} />
              )}
            </div>

            {/* Right side: Funding Sources Overview */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Funding Summary</h3>
                {sources.length === 0 ? (
                  <p className="text-slate-500 text-sm">No funding sources configured. Go to the **Sources** tab to configure your first source.</p>
                ) : (
                  <div className="space-y-4">
                    {sources.map(source => (
                      <div key={source.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            {getSourceIcon(source.type)}
                            <div>
                              <h4 className="font-semibold text-white text-sm">{source.name}</h4>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                {source.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {source.type !== 'Person' ? (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Remaining Balance</span>
                              <span className={source.remainingBalance < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                ${parseFloat(source.remainingBalance || 0).toFixed(2)}
                              </span>
                            </div>
                            {/* Simple Progress Bar */}
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${source.remainingBalance < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, (parseFloat(source.totalSpent || 0) / parseFloat(source.totalAmount || 1)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                              <span>Spent: ${parseFloat(source.totalSpent || 0).toFixed(2)}</span>
                              <span>Total: ${parseFloat(source.totalAmount || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 flex justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                            <span className="text-xs text-slate-500">Total Contributed:</span>
                            <span className="text-sm font-bold text-indigo-400">
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

        {activeTab === 'sources' && (
          <SourceManager />
        )}

        {activeTab === 'categories' && (
          <CategoryManager />
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      {activeTab === 'dashboard' && (
        <button 
          onClick={() => setShowForm(true)}
          className="md:hidden fixed bottom-8 right-8 bg-indigo-600 text-white p-5 rounded-full shadow-2xl shadow-indigo-600/45 z-40 active:scale-90 transition-transform"
        >
          <Plus size={32} />
        </button>
      )}

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
