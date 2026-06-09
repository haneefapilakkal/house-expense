import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Save, Folder, FileText, Layers, Container, Activity, Hammer, Grid, Brush, Zap, Droplet, Layout, Paintbrush, Users, MoreHorizontal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL + '/categories';

const ICON_MAP = {
  Folder: <Folder />,
  FileText: <FileText />,
  Layers: <Layers />,
  Container: <Container />,
  Activity: <Activity />,
  Hammer: <Hammer />,
  Grid: <Grid />,
  Brush: <Brush />,
  Zap: <Zap />,
  Droplet: <Droplet />,
  Layout: <Layout />,
  Paintbrush: <Paintbrush />,
  Users: <Users />,
  MoreHorizontal: <MoreHorizontal />
};

export const getIconComponent = (iconName) => {
  return ICON_MAP[iconName] || <Folder />;
};

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Folder' });

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/${editingCategory.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', icon: 'Folder' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon || 'Folder' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All related expenses will lose their category association.')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 mt-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Categories</h2>
          <p className="text-slate-500 text-sm mt-1">Configure house construction stages and category tags</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Laterite Stones"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Select Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {Object.keys(ICON_MAP).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
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
              <Save size={16} /> Save Category
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <p className="text-slate-500 text-center py-6">No categories added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex justify-between items-center p-3 sm:p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all group min-w-0 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 bg-slate-800 rounded-xl text-indigo-400 flex-shrink-0">
                  {getIconComponent(category.icon)}
                </div>
                <h4 className="font-semibold text-white text-base truncate">{category.name}</h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
export { ICON_MAP };
