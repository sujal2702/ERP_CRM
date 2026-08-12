import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challanService } from '../services/challan.service';
import { Challan, InsufficientStockDetail } from '../types/challan';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import {
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Phone,
  Mail,
  User,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Package,
} from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockShortfalls, setStockShortfalls] = useState<InsufficientStockDetail[]>([]);

  const isWritableRole = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallanDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setStockShortfalls([]);
    try {
      const response = await challanService.getChallanById(id);
      if (response.success && response.data?.challan) {
        setChallan(response.data.challan);
      } else {
        setError(response.message || 'Failed to load challan details');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sales Challan not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallanDetails();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setError(null);
    setStockShortfalls([]);
    setIsConfirming(true);

    try {
      const response = await challanService.confirmChallan(id);
      if (response.success && response.data?.challan) {
        setChallan(response.data.challan);
      }
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.details) {
        setError(err.response.data.message || 'Insufficient stock to confirm challan.');
        setStockShortfalls(err.response.data.details);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to confirm challan');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to cancel this draft challan?')) return;

    setError(null);
    setIsCancelling(true);

    try {
      const response = await challanService.cancelChallan(id);
      if (response.success && response.data?.challan) {
        setChallan(response.data.challan);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel challan');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-4 h-4" />
            <span>DRAFT</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircle className="w-4 h-4" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading sales challan details...</p>
        </div>
      </div>
    );
  }

  if (error && !challan) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto p-8">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-300">Challan Not Found</h2>
            <p className="text-sm text-slate-400">{error}</p>
            <Link
              to="/challans"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Challans</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <Link
              to="/challans"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-mono font-extrabold text-blue-400 tracking-tight">
                  {challan?.challanNumber}
                </h1>
                {getStatusBadge(challan?.status)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Customer: <span className="text-slate-200 font-semibold">{challan?.customer?.name}</span> ({challan?.customer?.businessName})
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isWritableRole && challan?.status === 'DRAFT' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                disabled={isCancelling || isConfirming}
                className="px-4 py-2.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-xl text-xs font-semibold transition disabled:opacity-40"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Challan'}
              </button>

              <button
                onClick={handleConfirm}
                disabled={isConfirming || isCancelling}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isConfirming ? 'Checking Stock & Confirming...' : 'Confirm Challan (Deduct Stock)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Insufficient Stock Error Banner (HTTP 409 Conflict) */}
        {stockShortfalls.length > 0 && (
          <div className="bg-red-950/80 border border-red-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-red-200">
                  Confirmation Rejected — Insufficient Inventory Stock
                </h3>
                <p className="text-xs text-red-300 mt-1">
                  The backend database transaction prevented confirmation because stock for one or more items is below requested quantities. <strong>No stock was deducted and the challan remains DRAFT.</strong>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-950/80 rounded-xl border border-red-900/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-950/40 text-red-300 uppercase tracking-wider font-semibold border-b border-red-900/40">
                  <tr>
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5">SKU</th>
                    <th className="px-4 py-2.5 text-center">Available Stock</th>
                    <th className="px-4 py-2.5 text-center">Requested Qty</th>
                    <th className="px-4 py-2.5 text-right">Shortfall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-900/30 text-slate-200">
                  {stockShortfalls.map((s, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-bold text-red-200">{s.product}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{s.sku}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-amber-400">{s.available} pcs</td>
                      <td className="px-4 py-2.5 text-center font-bold text-white">{s.requested} pcs</td>
                      <td className="px-4 py-2.5 text-right font-extrabold text-red-400">
                        -{s.requested - s.available} pcs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Generic Error Alert */}
        {error && stockShortfalls.length === 0 && (
          <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer & Challan Metadata Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer Details</span>
            </p>
            <div>
              <p className="text-sm font-bold text-white">{challan?.customer?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{challan?.customer?.businessName}</p>
              {challan?.customer?.mobile && (
                <p className="text-xs text-slate-300 mt-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{challan.customer.mobile}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Created By</span>
            </p>
            <div>
              <p className="text-sm font-bold text-white">{challan?.createdBy?.name || 'Staff'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{challan?.createdBy?.email}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Created Date</span>
            </p>
            <div>
              <p className="text-sm font-bold text-white">
                {challan?.createdAt ? new Date(challan.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {challan?.createdAt ? new Date(challan.createdAt).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Snapshot Items Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span>Product Line Items (Snapshot Data)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Product Name (Snapshot)</th>
                  <th className="px-4 py-3">SKU (Snapshot)</th>
                  <th className="px-4 py-3 text-right">Unit Price (Snapshot)</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {challan?.items?.map((item) => {
                  const subtotal = item.unitPriceSnapshot * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-bold text-slate-100">{item.productNameSnapshot}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{item.skuSnapshot}</td>
                      <td className="px-4 py-3 text-right text-slate-300 font-medium">
                        ₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-white text-sm">{item.quantity} pcs</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Quantity Delivered:
            </span>
            <span className="text-lg font-extrabold text-blue-400 font-mono">
              {challan?.totalQuantity} pcs
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
