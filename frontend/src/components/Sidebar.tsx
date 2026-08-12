import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileCheck,
  LogOut,
  X,
  Sparkles,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

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

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customer CRM', path: '/customers', icon: Users },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Inventory', path: '/inventory', icon: Boxes },
    { label: 'Sales Challans', path: '/challans', icon: FileCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col justify-between transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/dashboard" onClick={onClose} className="flex items-center space-x-3">
            <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-tight">Mini ERP Portal</h2>
              <p className="text-[10px] text-violet-400">Operations & CRM</p>
            </div>
          </Link>

          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-lg shadow-violet-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-violet-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-xl text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
