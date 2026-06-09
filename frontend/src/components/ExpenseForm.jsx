import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES_URL = '/categories';
const SOURCES_URL    = '/sources';
const EXPENSES_URL   = '/expenses';

const ExpenseForm = ({ onExpenseAdded, currentUser, onClose, editingExpense }) => {
  const isEditing = Boolean(editingExpense);

  const [categories, setCategories] = useState([]);
  const [sources, setSources]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    title:       editingExpense?.title       || '',
    amount:      editingExpense?.amount      || '',
    categoryId:  editingExpense?.categoryId  || '',
    sourceId:    editingExpense?.sourceId    || '',
    date:        editingExpense?.date        || new Date().toISOString().split('T')[0],
    description: editingExpense?.description || ''
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [catRes, srcRes] = await Promise.all([
          api.get(CATEGORIES_URL),
          api.get(SOURCES_URL)
        ]);
        setCategories(catRes.data);
        setSources(srcRes.data);

        // Auto-select first category/source only when creating new
        if (!isEditing) {
          setFormData(prev => ({
            ...prev,
            categoryId: prev.categoryId || catRes.data[0]?.id || '',
            sourceId:   prev.sourceId   || srcRes.data[0]?.id || ''
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim())           errors.title      = 'Title is required.';
    if (!formData.amount || parseFloat(formData.amount) <= 0)
                                          errors.amount     = 'Enter a valid amount greater than 0.';
    if (!formData.categoryId)             errors.categoryId = 'Please select a category.';
    if (!formData.sourceId)               errors.sourceId   = 'Please select a funding source.';
    if (!formData.date)                   errors.date       = 'Date is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: currentUser?.id
      };

      if (isEditing) {
        await api.put(`${EXPENSES_URL}/${editingExpense.id}`, payload);
      } else {
        await api.post(EXPENSES_URL, payload);
      }

      onExpenseAdded();
      onClose();
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setServerError(data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${
      fieldErrors[field]
        ? 'border-red-500 focus:ring-red-500/30'
        : 'border-slate-700 focus:ring-indigo-500/50'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up sm:animate-none pb-safe max-h-[95vh] flex flex-col">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto my-3 sm:hidden flex-shrink-0" />

        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg disabled:opacity-40"
        >
          <X size={22} />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 flex items-center gap-2">
            {isEditing
              ? <><Save className="text-indigo-400" size={22} /> Edit Expense</>
              : <><PlusCircle className="text-indigo-400" size={22} /> Add New Expense</>
            }
          </h2>

          {/* Server error */}
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {serverError}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-6">
              <AlertTriangle className="mx-auto text-yellow-500 mb-3" size={32} />
              <p className="text-slate-300 font-semibold mb-2">No Funding Sources Configured</p>
              <p className="text-slate-500 text-sm mb-6">
                Set up at least one funding source (Loan, Asset Sale, or Person) in the Sources tab before adding expenses.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Go Back &amp; Create Source
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Cement Bags Purchase"
                  className={inputClass('title')}
                />
                {fieldErrors.title && <p className="text-red-400 text-xs mt-1">{fieldErrors.title}</p>}
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Amount (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className={inputClass('amount')}
                  />
                  {fieldErrors.amount && <p className="text-red-400 text-xs mt-1">{fieldErrors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClass('date')}
                  />
                  {fieldErrors.date && <p className="text-red-400 text-xs mt-1">{fieldErrors.date}</p>}
                </div>
              </div>

              {/* Category + Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={inputClass('categoryId')}
                  >
                    <option value="">Select category…</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {fieldErrors.categoryId && <p className="text-red-400 text-xs mt-1">{fieldErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Funding Source <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="sourceId"
                    value={formData.sourceId}
                    onChange={handleChange}
                    className={inputClass('sourceId')}
                  >
                    <option value="">Select source…</option>
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                    ))}
                  </select>
                  {fieldErrors.sourceId && <p className="text-red-400 text-xs mt-1">{fieldErrors.sourceId}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Description <span className="text-slate-600 text-xs font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details…"
                  rows="2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isEditing ? 'Saving Changes…' : 'Adding Expense…'}
                  </>
                ) : (
                  <>
                    {isEditing ? <Save size={18} /> : <PlusCircle size={18} />}
                    {isEditing ? 'Save Changes' : 'Save Expense'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
