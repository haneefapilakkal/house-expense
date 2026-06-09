import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Calendar, Plus, LayoutDashboard, Coins, Tags, Sparkles, FileText, Shield, LogOut, Check, X as XIcon, AlertTriangle, Users } from 'lucide-react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import SourceManager from './SourceManager';
import { getSourceIcon } from './iconUtils';
import CategoryManager from './CategoryManager';
import Reports from './Reports';
import UserManagement from './UserManagement';
import api from '../utils/api';

const Dashboard = ({ currentUser, onLogout }) => {
  const [expenses, setExpenses]       = useState([]);
  const [sources, setSources]         = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('dashboard');

  const fetchData = async () => {
    try {
      const [expensesRes, sourcesRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/sources')
      ]);
      setExpenses(expensesRes.data);
      setSources(sourcesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (expense) => { setEditingExpense(expense); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingExpense(null); };

  const isAdmin = currentUser?.role === 'Admin';

  // Stats (exclude cancelled)
  const activeExpenses  = expenses.filter(e => e.status !== 'Cancelled');
  const totalAmount     = activeExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const currentMonth    = new Date().toLocaleString('default', { month: 'long' });
  const monthlyExpenses = activeExpenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    })
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const pendingCancellations = expenses.filter(e => e.status === 'Pending Cancellation');

  const handleApproveCancel = async (id) => {
    try { await api.put(`/expenses/${id}/approve-cancel`); fetchData(); }
    catch (err) { console.error(err); }
  };
  const handleRejectCancel = async (id) => {
    try { await api.put(`/expenses/${id}/reject-cancel`); fetchData(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-28">
      {/* Header */}
      <header className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900/60 mb-6 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-1.5">
            House <span className="text-indigo-500">Expenses</span>
            <Sparkles className="text-yellow-400 w-5 h-5 animate-pulse" />
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Smart tracking for your house project in Kerala</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Logged-in user badge */}
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              isAdmin ? 'bg-indigo-600/30 text-indigo-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold leading-none">{currentUser?.name}</p>
              <p className="text-slate-500 text-[10px] mt-0.5 flex items-center gap-1">
                {isAdmin && <Shield size={9} className="text-indigo-400" />}
                {currentUser?.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="ml-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-600/10 active:scale-95 transition-all sm:px-6 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 sm:px-6 max-w-6xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Admin Approvals Banner */}
            {isAdmin && pendingCancellations.length > 0 && (
              <div className="bg-slate-900 border border-yellow-500/20 rounded-2xl p-5 shadow-xl space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Pending Cancellation Requests ({pendingCancellations.length})
                </h3>
                <div className="space-y-3">
                  {pendingCancellations.map(exp => (
                    <div key={exp.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-950/60 rounded-xl border border-slate-850 gap-3 text-xs sm:text-sm"
                    >
                      <div>
                        <span className="font-semibold text-white">{exp.title}</span>
                        <span className="text-slate-400 mx-2">•</span>
                        <span className="font-bold text-red-400">₹{parseFloat(exp.amount).toFixed(2)}</span>
                        <span className="text-slate-400 mx-2">•</span>
                        <span className="text-slate-500">by {exp.creator?.name || 'User'} ({exp.category?.name})</span>
                        {exp.cancellationReason && (
                          <p className="text-xs text-yellow-400/70 mt-1 italic">Reason: "{exp.cancellationReason}"</p>
                        )}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => handleApproveCancel(exp.id)}
                          className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-600 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 font-semibold text-xs active:scale-95 transition-all">
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => handleRejectCancel(exp.id)}
                          className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 font-semibold text-xs active:scale-95 transition-all">
                          <XIcon size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-850 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-28 h-28 sm:w-32 sm:h-32 transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    <p className="text-indigo-100 text-sm font-medium mb-1">Total Project Spending</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">₹{totalAmount.toFixed(2)}</h2>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md">
                      <TrendingUp size={12} /> Overall Cost
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl relative overflow-hidden hover:border-slate-700 transition-all">
                    <Calendar className="absolute -right-4 -bottom-4 text-slate-800/60 w-28 h-28 sm:w-32 sm:h-32 transform rotate-12" />
                    <p className="text-slate-400 text-sm font-medium mb-1">{currentMonth} Spending</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">₹{monthlyExpenses.toFixed(2)}</h2>
                    <p className="mt-4 text-slate-500 text-xs sm:text-sm">Target: Maintain within budget</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center mt-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
                  </div>
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    currentUser={currentUser}
                    onExpenseDeleted={fetchData}
                    onEdit={handleEdit}
                  />
                )}
              </div>

              {/* Funding Sources sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-xl">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Funding Summary</h3>
                  {sources.length === 0 ? (
                    <p className="text-slate-500 text-xs sm:text-sm">No funding sources configured yet.</p>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {sources.map(source => (
                        <div key={source.id} className="p-3.5 sm:p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                          <div className="flex items-center gap-2.5 min-w-0 mb-2">
                            <span className="flex-shrink-0">{getSourceIcon(source.type)}</span>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white text-xs sm:text-sm truncate">{source.name}</h4>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{source.type}</span>
                            </div>
                          </div>
                          {source.type !== 'Person' ? (
                            <div>
                              <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 mb-1">
                                <span>Remaining</span>
                                <span className={source.remainingBalance < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  ₹{parseFloat(source.remainingBalance || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${source.remainingBalance < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${Math.min(100, Math.max(0, (parseFloat(source.totalSpent || 0) / parseFloat(source.totalAmount || 1)) * 100))}%` }} />
                              </div>
                              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                                <span>Spent: ₹{parseFloat(source.totalSpent || 0).toFixed(2)}</span>
                                <span>Total: ₹{parseFloat(source.totalAmount || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                              <span className="text-[10px] sm:text-xs text-slate-500">Contributed:</span>
                              <span className="text-xs sm:text-sm font-bold text-indigo-400">
                                ₹{parseFloat(source.totalSpent || 0).toFixed(2)}
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
          </div>
        )}

        {activeTab === 'reports'    && <Reports />}
        {activeTab === 'sources'    && <SourceManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'users'      && isAdmin && <UserManagement currentUser={currentUser} />}
      </main>

      {/* FAB (mobile) */}
      {(activeTab === 'dashboard' || activeTab === 'reports') && (
        <button
          onClick={() => setShowForm(true)}
          className="md:hidden fixed bottom-24 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/40 z-40 active:scale-90 transition-transform"
        >
          <Plus size={26} />
        </button>
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 px-2 py-2 pb-safe z-40 flex justify-around items-center no-print">
        {[
          { key: 'dashboard',  icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home' },
          { key: 'reports',    icon: <FileText className="w-5 h-5" />,        label: 'Reports' },
          { key: 'sources',    icon: <Coins className="w-5 h-5" />,           label: 'Sources' },
          { key: 'categories', icon: <Tags className="w-5 h-5" />,            label: 'Categories' },
          ...(isAdmin ? [{ key: 'users', icon: <Users className="w-5 h-5" />, label: 'Users' }] : [])
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all py-1 px-2 sm:px-3 rounded-xl ${
              activeTab === tab.key ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          onExpenseAdded={fetchData}
          currentUser={currentUser}
          onClose={handleCloseForm}
          editingExpense={editingExpense}
        />
      )}
    </div>
  );
};

export default Dashboard;
