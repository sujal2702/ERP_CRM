import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { AdminLayout } from '../components/AdminLayout';
import {
  Package,
  ArrowLeft,
  Save,
  AlertCircle,
  Tag,
  MapPin,
  Barcode,
  Boxes,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '',
    minimumStock: '',
    warehouseLocation: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await productService.getProductById(id);
          if (response.success && response.data?.product) {
            const prod = response.data.product;
            setFormData({
              name: prod.name || '',
              sku: prod.sku || '',
              category: prod.category || '',
              unitPrice: prod.unitPrice ? prod.unitPrice.toString() : '',
              currentStock: prod.currentStock ? prod.currentStock.toString() : '0',
              minimumStock: prod.minimumStock ? prod.minimumStock.toString() : '0',
              warehouseLocation: prod.warehouseLocation || '',
            });
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load product details');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice),
        minimumStock: parseInt(formData.minimumStock, 10) || 0,
        warehouseLocation: formData.warehouseLocation,
      };

      if (!isEditMode) {
        payload.currentStock = parseInt(formData.currentStock, 10) || 0;
        await productService.createProduct(payload);
      } else if (id) {
        await productService.updateProduct(id, payload);
      }

      navigate('/products');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-3xl w-full mx-auto p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <Link
              to="/products"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isEditMode ? 'Edit Product Details' : 'Add New Product'}
              </h1>
              <p className="text-xs text-slate-400">
                {isEditMode ? 'Update catalog information & minimum thresholds' : 'Register a new product item in the inventory catalog'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Hex Bolt M10 x 50mm Stainless Steel"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Unique SKU *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Barcode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="FAST-BOLT-M10-50"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Fasteners, Power Tools, Safety"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Unit Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Unit Price (₹) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-xs">
                  ₹
                </div>
                <input
                  type="number"
                  name="unitPrice"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="250.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Minimum Stock Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Minimum Stock Level *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="minimumStock"
                  min="0"
                  required
                  value={formData.minimumStock}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Current Stock (Disabled in Edit Mode) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Initial Stock Intake {isEditMode ? '(Managed via Movements)' : '*'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Boxes className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="currentStock"
                  min="0"
                  disabled={isEditMode}
                  required={!isEditMode}
                  value={formData.currentStock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Warehouse Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Warehouse Location *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="warehouseLocation"
                  required
                  value={formData.warehouseLocation}
                  onChange={handleChange}
                  placeholder="Aisle 2 - Rack B1"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
            <Link
              to="/products"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </main>
    </AdminLayout>
  );
};
