import React, { useState } from 'react';
import {
  Trash2, AlertCircle, Check, X, RefreshCw, Search,
  Pencil, Filter, Ban, MessageSquare
} from 'lucide-react';
import api from '../utils/api';
import { getIconComponent } from './iconUtils';

const API_URL = '/expenses';

// ─── Cancellation Reason Modal ────────────────────────────────────────────────
const CancelReasonModal = ({ expense, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <MessageSquare className="text-yellow-400" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Request Cancellation</h3>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              "<span className="text-slate-300">{expense.title}</span>" — ₹{parseFloat(expense.amount).toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Reason for Cancellation <span className="text-red-400">*</span>
          </label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            placeholder="e.g. Wrong amount entered, duplicate entry..."
            className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
              error ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-700 focus:ring-indigo-500/40'
            }`}
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            Keep It
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Ban size={15} /> Request Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Cancel Modal ────────────────────────────────────────────────────────
const AdminCancelModal = ({ expense, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-red-900/40 rounded-2xl sm:rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <Ban className="text-red-400" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Admin Cancel</h3>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              This will immediately cancel "<span className="text-slate-300">{expense?.title}</span>"
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Reason (Optional)
          </label>
          <textarea
            rows="2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incorrect entry corrected by admin..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none transition-all"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold text-sm transition-all">
            Back
          </button>
          <button
            onClick={() => onConfirm(reason || 'Cancelled by Admin')}
            className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Ban size={15} /> Cancel Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Status Tab Filter ─────────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'Active', label: 'Active' },
  { key: 'Pending Cancellation', label: 'Pending' },
  { key: 'Cancelled', label: 'Cancelled' }
];

// ─── Main ExpenseList Component ────────────────────────────────────────────────
const ExpenseList = ({ expenses, currentUser, onExpenseDeleted, onEdit }) => {
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);    // { expense }
  const [adminCancelModal, setAdminCancelModal] = useState(null); // { expense }
  const [actionLoading, setActionLoading] = useState(null); // expense id being acted on

  const isAdmin = currentUser?.role === 'Admin';

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      exp.source?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusTab === 'all' || exp.status === statusTab;
    return matchesSearch && matchesStatus;
  });

  // Counts per tab
  const counts = {
    all: expenses.length,
    Active: expenses.filter(e => e.status === 'Active').length,
    'Pending Cancellation': expenses.filter(e => e.status === 'Pending Cancellation').length,
    Cancelled: expenses.filter(e => e.status === 'Cancelled').length
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRequestCancel = async (reason) => {
    const exp = cancelModal.expense;
    setActionLoading(exp.id);
    setCancelModal(null);
    try {
      await api.put(`${API_URL}/${exp.id}/request-cancel`, { reason });
      onExpenseDeleted();
    } catch (err) {
      console.error('Error requesting cancellation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminCancel = async (reason) => {
    const exp = adminCancelModal.expense;
    setActionLoading(exp.id);
    setAdminCancelModal(null);
    try {
      await api.put(`${API_URL}/${exp.id}/admin-cancel`, { reason });
      onExpenseDeleted();
    } catch (err) {
      console.error('Error admin cancelling:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveCancel = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`${API_URL}/${id}/approve-cancel`);
      onExpenseDeleted();
    } catch (err) {
      console.error('Error approving cancellation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCancel = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`${API_URL}/${id}/reject-cancel`);
      onExpenseDeleted();
    } catch (err) {
      console.error('Error rejecting cancellation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`${API_URL}/${id}`);
      onExpenseDeleted();
    } catch (err) {
      console.error('Error deleting expense:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Modals */}
      {cancelModal && (
        <CancelReasonModal
          expense={cancelModal.expense}
          onConfirm={handleRequestCancel}
          onClose={() => setCancelModal(null)}
        />
      )}
      {adminCancelModal && (
        <AdminCancelModal
          expense={adminCancelModal.expense}
          onConfirm={handleAdminCancel}
          onClose={() => setAdminCancelModal(null)}
        />
      )}

      {/* Header + Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-white">Transactions</h3>
          <span className="text-xs text-slate-500 font-medium">{filtered.length} of {expenses.length}</span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, category, or source…"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === tab.key
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusTab === tab.key
                    ? tab.key === 'Pending Cancellation'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : tab.key === 'Cancelled'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-3xl">
          <Search className="mb-3 opacity-30" size={32} />
          <p className="text-base font-medium">No transactions found.</p>
          <p className="text-sm mt-1">
            {search ? `No results for "${search}"` : 'Add your first expense to get started.'}
          </p>
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-2.5">
        {filtered.map((expense) => {
          const isPending = expense.status === 'Pending Cancellation';
          const isCancelled = expense.status === 'Cancelled';
          const isLoading = actionLoading === expense.id;

          return (
            <div
              key={expense.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl transition-all group gap-3 ${
                isCancelled
                  ? 'border-slate-900 bg-slate-950/30 opacity-50'
                  : isPending
                  ? 'border-yellow-600/30 bg-yellow-500/5'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {/* Left: icon + details */}
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  isCancelled ? 'bg-slate-900 text-slate-600' : 'bg-slate-800 text-indigo-400'
                }`}>
                  {getIconComponent(expense.category?.icon)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className={`font-semibold text-sm ${
                      isCancelled ? 'line-through text-slate-500' : 'text-white'
                    }`}>
                      {expense.title}
                    </h4>
                    {isPending && (
                      <span className="text-[9px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Cancelled
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold">
                      {expense.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-[10px] bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded font-semibold">
                      {expense.source?.name || 'No Source'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {expense.creator && (
                      <span className="text-[10px] text-slate-600">by {expense.creator.name}</span>
                    )}
                  </div>

                  {/* Show cancellation reason if present */}
                  {(isPending || isCancelled) && expense.cancellationReason && (
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <MessageSquare size={11} className="text-slate-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500 italic leading-relaxed">
                        "{expense.cancellationReason}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: amount + actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-shrink-0 border-t border-slate-900/40 sm:border-0 pt-2 sm:pt-0">
                <div className="text-right">
                  <p className={`font-bold text-sm ${isCancelled ? 'line-through text-slate-500' : 'text-white'}`}>
                    ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {expense.description && (
                    <p className="text-[10px] text-slate-500 max-w-[140px] truncate" title={expense.description}>
                      {expense.description}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {isLoading ? (
                    <div className="w-7 h-7 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* PENDING: Admin approve / reject */}
                      {isPending && isAdmin && (
                        <>
                          <button
                            onClick={() => handleApproveCancel(expense.id)}
                            title="Approve Cancellation"
                            className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-900/50 rounded-lg text-emerald-400 transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleRejectCancel(expense.id)}
                            title="Reject — Restore to Active"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                          >
                            <RefreshCw size={13} />
                          </button>
                        </>
                      )}

                      {/* PENDING: Normal user waiting */}
                      {isPending && !isAdmin && (
                        <span className="text-[10px] text-yellow-500/70 italic">Awaiting Admin</span>
                      )}

                      {/* ACTIVE: Normal user — request cancel */}
                      {!isPending && !isCancelled && !isAdmin && (
                        <button
                          onClick={() => setCancelModal({ expense })}
                          title="Request Cancellation"
                          className="p-1.5 text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        >
                          <Ban size={15} />
                        </button>
                      )}

                      {/* ACTIVE: Admin — edit, admin-cancel, or delete */}
                      {!isPending && !isCancelled && isAdmin && (
                        <>
                          <button
                            onClick={() => onEdit(expense)}
                            title="Edit Transaction"
                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setAdminCancelModal({ expense })}
                            title="Cancel Transaction (Admin)"
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Ban size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            title="Delete Permanently"
                            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </>
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
