import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, Mail, AlertCircle, KeyRound, ShieldAlert, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to login. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillTestUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 text-violet-400 mb-4 border border-violet-500/30 shadow-lg shadow-violet-600/10">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mini ERP Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in with your assigned role credentials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@erp.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition duration-150 shadow-lg shadow-violet-600/30 disabled:opacity-50 flex justify-center items-center text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Test Accounts Quick Select */}
        <div className="px-8 pb-8 pt-2 bg-slate-950/40 border-t border-slate-800/60">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center space-x-1.5">
            <KeyRound className="w-3.5 h-3.5 text-violet-400" />
            <span>Quick Autofill Test Accounts</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => autofillTestUser('admin@erp.com')}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-purple-300 transition text-left flex items-center justify-between"
            >
              <span>Admin</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">ADMIN</span>
            </button>
            <button
              type="button"
              onClick={() => autofillTestUser('sales@erp.com')}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-emerald-300 transition text-left flex items-center justify-between"
            >
              <span>Sales</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">SALES</span>
            </button>
            <button
              type="button"
              onClick={() => autofillTestUser('warehouse@erp.com')}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-amber-300 transition text-left flex items-center justify-between"
            >
              <span>Warehouse</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">WAREHOUSE</span>
            </button>
            <button
              type="button"
              onClick={() => autofillTestUser('accounts@erp.com')}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-cyan-300 transition text-left flex items-center justify-between"
            >
              <span>Accounts</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">ACCOUNTS</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-3">Default Password: <code className="text-slate-400">Password123!</code></p>
        </div>
      </div>
    </div>
  );
};
