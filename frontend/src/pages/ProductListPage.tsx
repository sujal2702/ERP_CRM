import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { Product, ProductPagination } from '../types/product';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import {
  Package,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Tag,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWritableRole = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchProducts = async (searchQuery: string = search, pageNum: number = pagination.page, filterLow: boolean = lowStockFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(searchQuery, pageNum, 10, filterLow);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search, 1, lowStockFilter);
  }, [search, lowStockFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(search, newPage, lowStockFilter);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>IN STOCK</span>
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>LOW STOCK</span>
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            <span>OUT OF STOCK</span>
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
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Product Catalog</h1>
              <p className="text-xs text-slate-400">View and manage wholesale products, SKUs, pricing & minimum stock thresholds</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isWritableRole && (
              <Link
                to="/products/new"
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            )}
          </div>
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
              placeholder="Search by product name, SKU, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                lowStockFilter
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Low-Stock Filter {lowStockFilter ? '(Active)' : ''}</span>
            </button>

            <div className="text-xs text-slate-400 font-medium hidden md:block">
              Total Products: <span className="text-white font-bold">{pagination.total}</span>
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

        {/* Products Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No products found</p>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or add a new product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Product / SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Unit Price</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4">Min. Stock</th>
                    <th className="px-6 py-4">Warehouse</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-100 text-sm">{product.name}</p>
                          <span className="inline-block mt-0.5 text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {product.sku}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span>{product.category}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-100">
                        ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`font-bold text-sm ${product.currentStock <= product.minimumStock ? 'text-amber-400' : 'text-slate-100'}`}>
                          {product.currentStock}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {product.minimumStock}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>{product.warehouseLocation}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(product.stockStatus)}</td>

                      <td className="px-6 py-4 text-right">
                        {isWritableRole && (
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition inline-block"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
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
