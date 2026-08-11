import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory.service';
import { productService } from '../services/product.service';
import { Product, StockMovement, MovementType } from '../types/product';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  X,
  History,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

  // Inventory list state
  const [inventory, setInventory] = useState<Product[]>([]);
  const [inventoryPagination, setInventoryPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // Movements state
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementPagination, setMovementPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);

  // Stock Adjustment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  const canAdjustStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchInventory = async (searchQuery: string = search, pageNum: number = inventoryPagination.page, filterLow: boolean = lowStockFilter) => {
    setIsInventoryLoading(true);
    setInventoryError(null);
    try {
      const response = await inventoryService.getInventory(searchQuery, pageNum, 10, filterLow);
      if (response.success && response.data) {
        setInventory(response.data.inventory);
        setInventoryPagination(response.data.pagination);
      } else {
        setInventoryError(response.message || 'Failed to load inventory');
      }
    } catch (err: any) {
      setInventoryError(err.response?.data?.message || err.message || 'Failed to load inventory');
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const fetchMovements = async (pageNum: number = movementPagination.page) => {
    setIsMovementsLoading(true);
    try {
      const response = await inventoryService.getStockMovements(undefined, pageNum, 10);
      if (response.success && response.data) {
        setMovements(response.data.movements);
        setMovementPagination(response.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load movements:', err);
    } finally {
      setIsMovementsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory(search, 1, lowStockFilter);
    } else {
      fetchMovements(1);
    }
  }, [activeTab, search, lowStockFilter]);

  const openAdjustmentModal = async () => {
    setModalError(null);
    setIsModalOpen(true);
    try {
      const response = await productService.getProducts('', 1, 100);
      if (response.success && response.data) {
        setAllProducts(response.data.products);
        if (response.data.products.length > 0) {
          setSelectedProductId(response.data.products[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load product dropdown:', err);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const parsedQty = parseInt(quantity, 10);
    if (!selectedProductId || !parsedQty || parsedQty <= 0 || !reason.trim()) {
      setModalError('Please fill in all required fields with a valid positive quantity.');
      return;
    }

    const selectedProd = allProducts.find((p) => p.id === selectedProductId);
    if (movementType === 'OUT' && selectedProd && selectedProd.currentStock < parsedQty) {
      setModalError(
        `Insufficient stock! Product '${selectedProd.name}' only has ${selectedProd.currentStock} units available. Cannot perform OUT movement of ${parsedQty}. Stock cannot be negative.`
      );
      return;
    }

    setIsSubmittingModal(true);
    try {
      const response = await inventoryService.createStockAdjustment({
        productId: selectedProductId,
        movementType,
        quantity: parsedQty,
        reason: reason.trim(),
      });

      if (response.success) {
        setIsModalOpen(false);
        setQuantity('');
        setReason('');
        // Refresh inventory & movements
        fetchInventory(search, 1, lowStockFilter);
        fetchMovements(1);
      } else {
        setModalError(response.message || 'Stock adjustment failed');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Failed to apply stock adjustment');
    } finally {
      setIsSubmittingModal(false);
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
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Inventory & Stock Movements</h1>
              <p className="text-xs text-slate-400">Monitor stock levels, low-stock thresholds & audit movement logs</p>
            </div>
          </div>

          {canAdjustStock && (
            <button
              onClick={openAdjustmentModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Stock Adjustment (IN / OUT)</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Status Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'movements'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Movement History</span>
          </button>
        </div>

        {/* TAB 1: Inventory Overview */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search & Low Stock Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search inventory by product, SKU..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  lowStockFilter
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Show Low-Stock Alerts Only {lowStockFilter ? '(Active)' : ''}</span>
              </button>
            </div>

            {/* Error Alert */}
            {inventoryError && (
              <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{inventoryError}</span>
              </div>
            )}

            {/* Inventory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {isInventoryLoading ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-medium">Loading inventory...</p>
                </div>
              ) : inventory.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No inventory items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">SKU</th>
                        <th className="px-6 py-4">Current Stock</th>
                        <th className="px-6 py-4">Minimum Stock</th>
                        <th className="px-6 py-4">Warehouse Location</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4 font-bold text-slate-100">{item.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-400">{item.sku}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-bold ${
                                item.currentStock === 0
                                  ? 'text-red-400'
                                  : item.currentStock <= item.minimumStock
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-medium">{item.minimumStock}</td>
                          <td className="px-6 py-4 text-slate-300">{item.warehouseLocation}</td>
                          <td className="px-6 py-4">{getStatusBadge(item.stockStatus)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Movement History */}
        {activeTab === 'movements' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {isMovementsLoading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-medium">Loading stock movement history...</p>
              </div>
            ) : movements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <History className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No stock movements recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Product / SKU</th>
                      <th className="px-6 py-4">Movement Type</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Reason / Notes</th>
                      <th className="px-6 py-4">Logged By</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {movements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-100">{mov.product?.name || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{mov.product?.sku}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {mov.movementType === 'IN' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                              <span>STOCK IN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                              <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                              <span>STOCK OUT</span>
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-100 text-sm">
                          {mov.movementType === 'IN' ? `+${mov.quantity}` : `-${mov.quantity}`}
                        </td>

                        <td className="px-6 py-4 text-slate-300">{mov.reason}</td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5 text-slate-300">
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            <span>{mov.createdBy?.name || 'Staff'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(mov.createdAt).toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Boxes className="w-5 h-5 text-blue-400" />
                  <span>Manual Stock Adjustment</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs">
                {/* Select Product */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider">Select Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Available: {p.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Movement Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider">Movement Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMovementType('IN')}
                      className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 border transition ${
                        movementType === 'IN'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>STOCK IN (+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMovementType('OUT')}
                      className={`py-2.5 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 border transition ${
                        movementType === 'OUT'
                          ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>STOCK OUT (-)</span>
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity to add or subtract..."
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider">Reason for Adjustment *</label>
                  <textarea
                    rows={2}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Supplier delivery, Damage disposal, Physical audit correction..."
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingModal}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSubmittingModal ? 'Applying...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
