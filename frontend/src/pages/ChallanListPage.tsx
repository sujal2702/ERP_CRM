import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challanService } from '../services/challan.service';
import { Challan, ChallanStatus, ChallanPagination } from '../types/challan';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
} from 'lucide-react';

export const ChallanListPage: React.FC = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<ChallanPagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWritableRole = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallans = async (
    searchQuery: string = search,
    statusVal: string = statusFilter,
    pageNum: number = pagination.page
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedStatus = statusVal !== 'ALL' ? (statusVal as ChallanStatus) : undefined;
      const response = await challanService.getChallans(searchQuery, parsedStatus, pageNum, 10);
      if (response.success && response.data) {
        setChallans(response.data.challans);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch challans');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching challans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans(search, statusFilter, 1);
  }, [search, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchChallans(search, statusFilter, newPage);
    }
  };

  const getStatusBadge = (status: ChallanStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>DRAFT</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Top Title & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sales Challans</h1>
              <p className="text-xs text-slate-400">Generate draft challans & execute atomic inventory stock deductions</p>
            </div>
          </div>

          {isWritableRole && (
            <Link
              to="/challans/new"
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sales Challan</span>
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by challan number, customer name, business..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT Only</option>
              <option value="CONFIRMED">CONFIRMED Only</option>
              <option value="CANCELLED">CANCELLED Only</option>
            </select>

            <div className="text-xs text-slate-400 font-medium hidden md:block">
              Total Challans: <span className="text-white font-bold">{pagination.total}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Challans Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Loading sales challans...</p>
            </div>
          ) : challans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No sales challans found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or create a new challan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Challan #</th>
                    <th className="px-6 py-4">Customer / Business</th>
                    <th className="px-6 py-4">Total Qty</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created By</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {challans.map((challan) => (
                    <tr key={challan.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-blue-400 text-sm">{challan.challanNumber}</td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-100">{challan.customer?.name || 'N/A'}</p>
                          <div className="flex items-center space-x-1 text-slate-400 text-[11px] mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{challan.customer?.businessName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-100 text-sm">
                        {challan.totalQuantity} pcs
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(challan.status)}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>{challan.createdBy?.name || 'Staff'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(challan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/challans/${challan.id}`}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition inline-block"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Page <strong className="text-white">{pagination.page}</strong> of <strong className="text-white">{pagination.totalPages}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
