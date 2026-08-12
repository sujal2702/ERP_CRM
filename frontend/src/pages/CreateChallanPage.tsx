import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { challanService } from '../services/challan.service';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { Customer } from '../types/customer';
import { Product } from '../types/product';
import { AdminLayout } from '../components/AdminLayout';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Building2,
  Package,
  Calculator,
} from 'lucide-react';

interface SelectedLineItem {
  productId: string;
  quantity: number;
}

export const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<SelectedLineItem[]>([
    { productId: '', quantity: 1 },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoading(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers('', 1, 100),
          productService.getProducts('', 1, 100),
        ]);

        if (custRes.success && custRes.data?.customers) {
          setCustomers(custRes.data.customers);
          if (custRes.data.customers.length > 0) {
            setSelectedCustomerId(custRes.data.customers[0].id);
          }
        }

        if (prodRes.success && prodRes.data?.products) {
          setProducts(prodRes.data.products);
          if (prodRes.data.products.length > 0) {
            setLineItems([{ productId: prodRes.data.products[0].id, quantity: 1 }]);
          }
        }
      } catch (err: any) {
        setError('Failed to load customers or products dropdown data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  const addLineItem = () => {
    if (products.length > 0) {
      setLineItems((prev) => [...prev, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof SelectedLineItem, value: any) => {
    setLineItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Live Calculations
  const calculateTotalQuantity = () => {
    return lineItems.reduce((acc, item) => acc + (parseInt(item.quantity as any, 10) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one valid product item with a quantity greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await challanService.createChallan({
        customerId: selectedCustomerId,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: parseInt(i.quantity as any, 10),
        })),
      });

      if (response.success && response.data?.challan) {
        navigate(`/challans/${response.data.challan.id}`);
      } else {
        setError(response.message || 'Failed to create challan draft');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create sales challan draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <Link
              to="/challans"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Create Sales Challan Draft</h1>
              <p className="text-xs text-slate-400">Select customer, specify multi-product line items & save draft</p>
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

        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Loading customer & product options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
            {/* Customer Selector */}
            <div className="space-y-2 pb-6 border-b border-slate-800">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Select Customer *</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.businessName} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>Product Line Items</span>
                </h2>

                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, idx) => {
                  const selectedProduct = products.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950 p-4 rounded-xl border border-slate-800/80"
                    >
                      {/* Product Selector */}
                      <div className="md:col-span-6 space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateLineItem(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) — Avail: {p.currentStock}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Input */}
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Quantity (Pcs)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Unit Price Snapshot Preview */}
                      <div className="md:col-span-2 space-y-1 text-right">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase block">Unit Price</label>
                        <p className="text-xs font-semibold text-slate-200 py-1.5">
                          ₹{selectedProduct ? selectedProduct.unitPrice.toLocaleString('en-IN') : '0.00'}
                        </p>
                      </div>

                      {/* Remove Line Item */}
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          disabled={lineItems.length <= 1}
                          className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 transition"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Quantity Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span>Calculated Total Quantity</span>
              </div>
              <span className="text-lg font-extrabold text-blue-400 font-mono">
                {calculateTotalQuantity()} pcs
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
              <Link
                to="/challans"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Draft...' : 'Save as DRAFT'}</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </AdminLayout>
  );
};
