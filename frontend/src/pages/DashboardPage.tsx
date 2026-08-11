import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck, ShieldCheck, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'SALES':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'WAREHOUSE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ACCOUNTS':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">Mini ERP Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user?.role)}`}>
            {user?.role}
          </span>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-xl text-xs font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
              <p className="text-sm text-slate-400 mt-0.5">Session authenticated via JWT token</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Authenticated User</span>
              </div>
              <p className="text-base font-semibold text-slate-100">{user?.name}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Email Address</span>
              </div>
              <p className="text-base font-semibold text-slate-100">{user?.email}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Assigned Role</span>
              </div>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Phase 3 Status Alert */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 flex items-start space-x-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-emerald-300">Phase 3 Authentication Completed Successfully</h3>
            <p className="text-sm text-slate-300 mt-1">
              JWT authentication, Role-Based Access Control middleware, and frontend AuthContext are active. Ready for Customer CRM (Phase 4).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
