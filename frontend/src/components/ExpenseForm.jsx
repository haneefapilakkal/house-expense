import React, { useState, useEffect } from 'react';
import { PlusCircle, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const CATEGORIES_URL = import.meta.env.VITE_API_URL + '/categories';
const SOURCES_URL = import.meta.env.VITE_API_URL + '/sources';
const EXPENSES_URL = import.meta.env.VITE_API_URL + '/expenses';

const ExpenseForm = ({ onExpenseAdded, currentUser, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryId: '',
    sourceId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [categoriesRes, sourcesRes] = await Promise.all([
          axios.get(CATEGORIES_URL),
          axios.get(SOURCES_URL)
        ]);
        
        setCategories(categoriesRes.data);
        setSources(sourcesRes.data);
        
        // Auto-select first category and source if available
        setFormData(prev => ({
          ...prev,
          categoryId: categoriesRes.data[0]?.id || '',
          sourceId: sourcesRes.data[0]?.id || ''
        }));
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.sourceId) {
      alert('Please select a Category and a Funding Source.');
      return;
    }
    try {
      const payload = {
        ...formData,
        userId: currentUser?.id
      };
      await axios.post(EXPENSES_URL, payload);
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up sm:animate-none pb-safe max-h-[92vh] flex flex-col">
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto my-3 sm:hidden flex-shrink-0"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors sm:top-5 sm:right-5 p-1 hover:bg-slate-800 rounded-lg"
        >
          <X size={22} />
        </button>
        
        <div className="p-6 sm:p-8 overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <PlusCircle className="text-indigo-400" />
            Add New Expense
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-6">
              <AlertTriangle className="mx-auto text-yellow-500 mb-3" size={32} />
              <p className="text-slate-300 font-semibold mb-2">No Funding Sources Configured</p>
              <p className="text-slate-500 text-sm mb-6">
                You need to configure at least one funding source (e.g. Person, Loan, or Asset Sale) before recording an expense.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Go Back & Create Source
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Cement Bags Purchase"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Funding Source</label>
                  <select
                    name="sourceId"
                    value={formData.sourceId}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  >
                    {sources.map(source => (
                      <option key={source.id} value={source.id}>
                        {source.name} ({source.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Details..."
                  rows="2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                <PlusCircle size={18} />
                Save Expense
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
