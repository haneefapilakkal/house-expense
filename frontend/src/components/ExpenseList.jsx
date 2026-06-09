import React from 'react';
import { ShoppingBag, Home, Zap, Coffee, Car, Film, HeartPulse, MoreHorizontal, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/expenses';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Rent/Mortgage': return <Home className="text-blue-400" />;
    case 'Utilities': return <Zap className="text-yellow-400" />;
    case 'Groceries': return <ShoppingBag className="text-green-400" />;
    case 'Dining Out': return <Coffee className="text-orange-400" />;
    case 'Transport': return <Car className="text-indigo-400" />;
    case 'Entertainment': return <Film className="text-purple-400" />;
    case 'Healthcare': return <HeartPulse className="text-red-400" />;
    default: return <MoreHorizontal className="text-slate-400" />;
  }
};

const ExpenseList = ({ expenses, onExpenseDeleted }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        onExpenseDeleted();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-3xl mt-6">
        <p className="text-lg">No expenses recorded yet.</p>
        <p className="text-sm">Start by adding your first expense!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-white px-2">Recent Transactions</h3>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div 
            key={expense.id} 
            className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <h4 className="font-semibold text-white">{expense.title}</h4>
                <p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                <p className="text-xs text-slate-500">{expense.category}</p>
              </div>
              <button 
                onClick={() => handleDelete(expense.id)}
                className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
