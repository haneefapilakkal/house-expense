import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2, Home, Sparkles } from 'lucide-react';
import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_API_URL + '/auth/login';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(AUTH_URL, {
        email: email.trim().toLowerCase(),
        password
      });

      const { token, user } = res.data;
      localStorage.setItem('houseExpenseToken', token);
      localStorage.setItem('houseExpenseUser', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4">
            <Home className="text-indigo-400 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            House <span className="text-indigo-400">Expenses</span>
            <Sparkles className="text-yellow-400 w-5 h-5 animate-pulse" />
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kerala Home Construction Tracker</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to continue</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
              <span className="mt-0.5">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@home.com"
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 text-sm"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                : <><LogIn size={18} /> Sign In</>
              }
            </button>
          </form>
        </div>

        {/* Default credentials hint */}
        <div className="mt-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-400 mb-2">Default Credentials</p>
          <div className="flex justify-between">
            <span>👑 Admin (Haneefa)</span>
            <span className="font-mono text-slate-400">admin@home.com / admin123</span>
          </div>
          <div className="flex justify-between">
            <span>🔧 Normal (Contractor)</span>
            <span className="font-mono text-slate-400">user@home.com / user123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
