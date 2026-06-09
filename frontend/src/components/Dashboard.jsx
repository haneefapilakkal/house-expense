import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, TrendingUp, Calendar, Plus } from 'lucide-react';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';

const API_URL = import.meta.env.VITE_API_URL + '/expenses';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(API_URL);
      setExpenses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
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
      <header className="p-6 md:p-10 max-w-5xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">House <span className="text-indigo-500">Expenses</span></h1>
          <p className="text-slate-500 mt-1">Smart tracking for your new home</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all md:px-6 md:flex md:items-center md:gap-2"
        >
          <Plus size={24} />
          <span className="hidden md:inline font-semibold">Add Expense</span>
        </button>
      </header>

      <main className="px-6 max-w-5xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <p className="text-indigo-100 font-medium mb-1">Total Balance Spent</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">${totalAmount.toFixed(2)}</h2>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
              <TrendingUp size={14} />
              Overall Spending
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
          <ExpenseList expenses={expenses} onExpenseDeleted={fetchExpenses} />
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <button 
        onClick={() => setShowForm(true)}
        className="md:hidden fixed bottom-8 right-8 bg-indigo-600 text-white p-5 rounded-full shadow-2xl shadow-indigo-600/40 z-40 active:scale-90 transition-transform"
      >
        <Plus size={32} />
      </button>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm 
          onExpenseAdded={fetchExpenses} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
