import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customer.service';
import { Customer, CustomerPagination } from '../types/customer';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from '../components/AdminLayout';
import {
  Users,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Building2,
  Phone,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const CustomerListPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<CustomerPagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWritableRole = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchCustomers = async (searchQuery: string = search, pageNum: number = pagination.page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomers(searchQuery, pageNum, 10);
      if (response.success && response.data) {
        setCustomers(response.data.customers);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch customers');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search, 1);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCustomers(search, newPage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ACTIVE</span>;
      case 'LEAD':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">LEAD</span>;
      case 'INACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">INACTIVE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'WHOLESALE':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">WHOLESALE</span>;
      case 'DISTRIBUTOR':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">DISTRIBUTOR</span>;
      case 'RETAIL':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-slate-300 border border-slate-600">RETAIL</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300">{type}</span>;
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Top Title & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Customer CRM</h1>
              <p className="text-xs text-slate-400">Manage client accounts, business profiles & follow-up logs</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isWritableRole && (
              <Link
                to="/customers/new"
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Customer</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, business, mobile, GST, email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Total Results: <span className="text-white font-bold">{pagination.total}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No customers found</p>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or add a new customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Customer / Business</th>
                    <th className="px-6 py-4">Mobile & Email</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Follow-up Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-100 text-sm">{customer.name}</p>
                          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{customer.businessName}</span>
                          </div>
                          {customer.gstNumber && (
                            <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono bg-slate-800/60 px-1.5 py-0.5 rounded">
                              GST: {customer.gstNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                            <span>{customer.mobile}</span>
                          </div>
                          {customer.email && (
                            <p className="text-slate-400 text-[11px]">{customer.email}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">{getTypeBadge(customer.customerType)}</td>

                      <td className="px-6 py-4">{getStatusBadge(customer.status)}</td>

                      <td className="px-6 py-4">
                        {customer.followUpDate ? (
                          <div className="flex items-center space-x-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>{new Date(customer.followUpDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Not Scheduled</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {isWritableRole && (
                            <Link
                              to={`/customers/${customer.id}/edit`}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
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
    </AdminLayout>
  );
};
