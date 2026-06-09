import React from 'react';
import { Trash2, AlertCircle, Check, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { getIconComponent } from './CategoryManager';

const API_URL = import.meta.env.VITE_API_URL + '/expenses';

const ExpenseList = ({ expenses, currentUser, onExpenseDeleted }) => {
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this expense?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        onExpenseDeleted();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleRequestCancel = async (id) => {
    if (window.confirm('Are you sure you want to request cancellation for this expense? It will require Admin approval.')) {
      try {
        await axios.put(`${API_URL}/${id}/request-cancel`);
        onExpenseDeleted();
      } catch (error) {
        console.error('Error requesting cancellation:', error);
      }
    }
  };

  const handleApproveCancel = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/approve-cancel`);
      onExpenseDeleted();
    } catch (error) {
      console.error('Error approving cancellation:', error);
    }
  };

  const handleRejectCancel = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/reject-cancel`);
      onExpenseDeleted();
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
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
        {expenses.map((expense) => {
          const isPending = expense.status === 'Pending Cancellation';
          const isCancelled = expense.status === 'Cancelled';
          const isAdmin = currentUser?.role === 'Admin';

          return (
            <div 
              key={expense.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/50 border rounded-2xl hover:border-slate-700 transition-all group gap-3 ${
                isCancelled ? 'border-red-950/20 bg-slate-950/20 opacity-40' : 'border-slate-800'
              } ${isPending ? 'border-yellow-500/20 bg-yellow-500/5' : ''}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform ${
                  isCancelled ? 'bg-slate-900 text-slate-600' : 'bg-slate-850 text-indigo-400'
                }`}>
                  {getIconComponent(expense.category?.icon)}
                </div>
                <div className="min-w-0">
                  <h4 className={`font-semibold text-white truncate ${isCancelled ? 'line-through text-slate-500' : ''}`} title={expense.title}>
                    {expense.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold flex-shrink-0">
                      {expense.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-[10px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-semibold flex-shrink-0">
                      Source: {expense.source?.name || 'None'}
                    </span>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                    {expense.creator && (
                      <span className="text-[10px] text-slate-600 flex-shrink-0">
                        by {expense.creator.name}
                      </span>
                    )}
                    
                    {/* Status Badges */}
                    {isPending && (
                      <span className="text-[9px] bg-yellow-500/15 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                        Cancellation Pending
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[9px] bg-red-500/15 text-red-500 border border-red-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount and Action Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-900/40 sm:border-t-0 pt-2 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className={`font-bold ${isCancelled ? 'line-through text-slate-500' : 'text-white'}`}>
                    ₹{parseFloat(expense.amount).toFixed(2)}
                  </p>
                  {expense.description && (
                    <p className="text-[10px] text-slate-500 max-w-[150px] truncate" title={expense.description}>
                      {expense.description}
                    </p>
                  )}
                </div>
                
                {/* Action buttons based on Role and Status */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isPending && isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleApproveCancel(expense.id)}
                        title="Approve Cancellation"
                        className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-900/50 rounded-lg text-emerald-400 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleRejectCancel(expense.id)}
                        title="Reject Cancellation"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {isPending && !isAdmin && (
                    <span className="text-[10px] text-slate-550 italic" title="Awaiting Admin approval">
                      Pending Admin
                    </span>
                  )}

                  {!isPending && !isCancelled && (
                    isAdmin ? (
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        title="Delete Permanently"
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRequestCancel(expense.id)}
                        title="Request Cancellation"
                        className="p-2 text-slate-500 hover:text-yellow-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
