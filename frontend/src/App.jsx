import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import api from './utils/api';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [checking, setChecking]       = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('houseExpenseToken');
      const saved = localStorage.getItem('houseExpenseUser');

      if (!token || !saved) {
        setChecking(false);
        return;
      }

      try {
        // Verify token is still valid on the server
        const res = await api.get('/auth/me');
        setCurrentUser(res.data);
      } catch {
        // Token expired or invalid — clear and show login
        localStorage.removeItem('houseExpenseToken');
        localStorage.removeItem('houseExpenseUser');
      } finally {
        setChecking(false);
      }
    };

    validateSession();
  }, []);

  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = () => {
    localStorage.removeItem('houseExpenseToken');
    localStorage.removeItem('houseExpenseUser');
    setCurrentUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
};

export default App;
