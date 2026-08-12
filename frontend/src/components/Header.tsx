import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Sparkles, LogOut } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
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
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl lg:hidden transition"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2.5 lg:hidden">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">Mini ERP</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-100">{user?.name}</p>
          <p className="text-[11px] text-slate-400">{user?.email}</p>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleBadgeColor(user?.role)}`}>
          {user?.role}
        </span>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-xl text-xs font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
