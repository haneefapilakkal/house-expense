import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getIconComponent } from './CategoryManager';

const API_URL = import.meta.env.VITE_API_URL + '/expenses';

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
              <div className="p-3 bg-slate-850 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                {getIconComponent(expense.category?.icon)}
              </div>
              <div>
                <h4 className="font-semibold text-white">{expense.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold">
                    {expense.category?.name || 'Uncategorized'}
                  </span>
                  <span className="text-[10px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-semibold">
                    Source: {expense.source?.name || 'None'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-white">₹{parseFloat(expense.amount).toFixed(2)}</p>
                {expense.description && (
                  <p className="text-[10px] text-slate-500 max-w-[150px] truncate" title={expense.description}>
                    {expense.description}
                  </p>
                )}
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
