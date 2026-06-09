import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getSourceIcon } from './iconUtils';

const API_URL = import.meta.env.VITE_API_URL + '/sources';

const SourceManager = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Person',
    totalAmount: '',
    description: ''
  });

  const fetchSources = async () => {
    try {
      const response = await axios.get(API_URL);
      setSources(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        totalAmount: formData.type === 'Person' ? null : parseFloat(formData.totalAmount || 0)
      };

      if (editingSource) {
        await axios.put(`${API_URL}/${editingSource.id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      fetchSources();
      resetForm();
    } catch (error) {
      console.error('Error saving source:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'Person', totalAmount: '', description: '' });
    setEditingSource(null);
    setShowForm(false);
  };

  const handleEdit = (source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      totalAmount: source.totalAmount !== null ? source.totalAmount.toString() : '',
      description: source.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this funding source? All related expenses will lose their source association.')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchSources();
      } catch (error) {
        console.error('Error deleting source:', error);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 mt-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Funding Sources</h2>
          <p className="text-slate-500 text-sm mt-1">Configure loans, asset sales (gold), or individual contributors</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Source
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">{editingSource ? 'Edit Source' : 'New Source'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Source Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. SBI House Loan"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Person">Person (Individual Contributor)</option>
                <option value="Loan">Loan (Bank/External)</option>
                <option value="Asset Sale">Asset Sale (Gold/Land/etc.)</option>
              </select>
            </div>

            {formData.type !== 'Person' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Total Budget/Limit</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Gold jewelry sold at Muthoot Finance..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Save size={16} /> Save Source
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : sources.length === 0 ? (
        <p className="text-slate-500 text-center py-6">No funding sources configured yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group relative"
            >
              <div className="flex justify-between items-start gap-2 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-slate-850 rounded-xl flex-shrink-0">
                    {getSourceIcon(source.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-lg truncate" title={source.name}>{source.name}</h4>
                    <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-800 text-slate-400">
                      {source.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(source)}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {source.description && (
                <p className="text-slate-500 text-xs mt-3 bg-slate-950/30 p-2.5 rounded-lg italic">
                  {source.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-900">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Spent</span>
                  <span className="text-base font-bold text-white">₹{parseFloat(source.totalSpent || 0).toFixed(2)}</span>
                </div>
                {source.type !== 'Person' ? (
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Remaining Balance</span>
                    <span className={`text-base font-bold ${source.remainingBalance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      ₹{parseFloat(source.remainingBalance || 0).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Type</span>
                    <span className="text-sm font-semibold text-indigo-400">Personal Spending</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourceManager;
