import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, User as UserIcon, Shield, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

const UserForm = ({ user, currentUser, onSave, onClose }) => {
  const isEditing = Boolean(user);
  const [form, setForm] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    role:     user?.role     || 'Normal',
    password: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    if (!isEditing && !form.password) e.password = 'Password is required for new users.';
    if (form.password && form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    if (form.password && form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }

    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;

      if (isEditing) {
        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      onSave();
    } catch (err) {
      setErrors({ server: err.response?.data?.error || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); },
    className: `w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[key] ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-700 focus:ring-indigo-500/40'
    }`
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="font-bold text-white text-lg">
            {isEditing ? `Edit ${user.name}` : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {errors.server && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {errors.server}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Name <span className="text-red-400">*</span>
              </label>
              <input type="text" placeholder="Full name" {...field('name')} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Role
              </label>
              <select {...field('role')} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="Normal">Normal User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Email <span className="text-red-400">*</span>
            </label>
            <input type="email" placeholder="user@home.com" {...field('email')} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              {isEditing ? 'New Password' : 'Password'} {!isEditing && <span className="text-red-400">*</span>}
              {isEditing && <span className="text-slate-600 font-normal ml-1">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" {...field('password')} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {form.password && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input type={showPass ? 'text' : 'password'} placeholder="Repeat password" {...field('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> {isEditing ? 'Update' : 'Create User'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main User Management ─────────────────────────────────────────────────────
const UserManagement = ({ currentUser }) => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) return;
    setDeleting(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditUser(null);
    fetchUsers();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 mt-6">
      {(showForm || editUser) && (
        <UserForm
          user={editUser}
          currentUser={currentUser}
          onSave={handleSaved}
          onClose={() => { setShowForm(false); setEditUser(null); }}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-indigo-400" size={22} /> User Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage who can access and use the system</p>
        </div>
        <button
          onClick={() => { setEditUser(null); setShowForm(true); }}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No users found.</p>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  user.role === 'Admin' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-sm">{user.name}</span>
                    {user.role === 'Admin' && (
                      <span className="text-[9px] bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="text-[9px] bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 border-t border-slate-900/40 sm:border-0 pt-2 sm:pt-0">
                <span className="text-[10px] text-slate-600 mr-2 hidden sm:block">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => { setEditUser(user); setShowForm(true); }}
                  className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Edit user"
                >
                  <Pencil size={15} />
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={deleting === user.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    title="Delete user"
                  >
                    {deleting === user.id
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Trash2 size={15} />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
