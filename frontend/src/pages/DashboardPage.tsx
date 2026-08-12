import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { challanService } from '../services/challan.service';
import { AdminLayout } from '../components/AdminLayout';
import {
  Users,
  Package,
  Boxes,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  Plus,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalChallans: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setIsLoading(true);
      try {
        const [custRes, prodRes, lowStockRes, challanRes] = await Promise.all([
          customerService.getCustomers('', 1, 1),
          productService.getProducts('', 1, 1),
          productService.getProducts('', 1, 1, true),
          challanService.getChallans('', undefined, 1, 1),
        ]);

        setMetrics({
          totalCustomers: custRes.data?.pagination.total || 0,
          totalProducts: prodRes.data?.pagination.total || 0,
          lowStockCount: lowStockRes.data?.pagination.total || 0,
          totalChallans: challanRes.data?.pagination.total || 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  const isWritableRole = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <AdminLayout>
      <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name}!</h1>
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Role: <span className="text-blue-300 font-semibold">{user?.role}</span> — System metrics active on Neon PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Active Session Token</span>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Customers */}
          <Link
            to="/customers"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl shadow-xl transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">
                {isLoading ? '...' : metrics.totalCustomers}
              </span>
              <span className="text-xs text-blue-400 group-hover:translate-x-1 transition flex items-center">
                View CRM <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* Total Products */}
          <Link
            to="/products"
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl shadow-xl transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30 group-hover:scale-110 transition">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">
                {isLoading ? '...' : metrics.totalProducts}
              </span>
              <span className="text-xs text-purple-400 group-hover:translate-x-1 transition flex items-center">
                Catalog <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* Low Stock Products */}
          <Link
            to="/inventory"
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
              <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30 group-hover:scale-110 transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className={`text-3xl font-extrabold font-mono ${metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {isLoading ? '...' : metrics.lowStockCount}
              </span>
              <span className="text-xs text-amber-400 group-hover:translate-x-1 transition flex items-center">
                Audit Stock <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* Total Sales Challans */}
          <Link
            to="/challans"
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl shadow-xl transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Challans</span>
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:scale-110 transition">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">
                {isLoading ? '...' : metrics.totalChallans}
              </span>
              <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition flex items-center">
                View Challans <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action Shortcuts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {isWritableRole && (
              <Link
                to="/customers/new"
                className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center space-x-3 transition group"
              >
                <UserPlus className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-slate-200">Add Customer</span>
              </Link>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
              <Link
                to="/products/new"
                className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center space-x-3 transition group"
              >
                <Plus className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-slate-200">Add Product</span>
              </Link>
            )}

            <Link
              to="/inventory"
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center space-x-3 transition group"
            >
              <Boxes className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-slate-200">View Inventory</span>
            </Link>

            {isWritableRole && (
              <Link
                to="/challans/new"
                className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center space-x-3 transition group"
              >
                <PlusCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-slate-200">Create Challan</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};
