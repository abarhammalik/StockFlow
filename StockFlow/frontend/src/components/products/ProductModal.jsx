import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import CategoryModal from '../categories/CategoryModal';
import SupplierModal from '../suppliers/SupplierModal';
import { createProduct, updateProduct, getCategories, getSuppliers } from '../../services/api';
import { Plus } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, product = null, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quick Add sub-modal states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    supplierId: '',
    price: '',
    costPrice: '',
    quantity: '',
    minStock: 5,
    maxStock: 100,
    unit: 'pcs',
    status: 'active'
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (product) {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          categoryId: product.categoryId?._id || product.categoryId || '',
          supplierId: product.supplierId?._id || product.supplierId || '',
          price: product.price ?? '',
          costPrice: product.costPrice ?? '',
          quantity: product.quantity ?? 0,
          minStock: product.minStock ?? 5,
          maxStock: product.maxStock ?? 100,
          unit: product.unit || 'pcs',
          status: product.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          sku: '',
          description: '',
          categoryId: '',
          supplierId: '',
          price: '',
          costPrice: '',
          quantity: 0,
          minStock: 5,
          maxStock: 100,
          unit: 'pcs',
          status: 'active'
        });
      }
      setError(null);
    }
  }, [isOpen, product]);

  const loadDropdowns = async () => {
    try {
      const [catRes, supRes] = await Promise.all([getCategories(), getSuppliers()]);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
      return { categories: catRes.data || [], suppliers: supRes.data || [] };
    } catch (err) {
      console.error('Failed to load categories/suppliers dropdowns', err);
    }
  };

  const handleCategoryCreated = async (createdCat) => {
    const updated = await loadDropdowns();
    if (createdCat && createdCat._id) {
      setFormData((prev) => ({ ...prev, categoryId: createdCat._id }));
    } else if (updated && updated.categories && updated.categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: updated.categories[updated.categories.length - 1]._id }));
    }
    setIsAddCategoryOpen(false);
  };

  const handleSupplierCreated = async (createdSup) => {
    const updated = await loadDropdowns();
    if (createdSup && createdSup._id) {
      setFormData((prev) => ({ ...prev, supplierId: createdSup._id }));
    } else if (updated && updated.suppliers && updated.suppliers.length > 0) {
      setFormData((prev) => ({ ...prev, supplierId: updated.suppliers[updated.suppliers.length - 1]._id }));
    }
    setIsAddSupplierOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      quantity: parseInt(formData.quantity, 10) || 0,
      minStock: parseInt(formData.minStock, 10) || 5,
      maxStock: parseInt(formData.maxStock, 10) || 100
    };

    try {
      if (product) {
        await updateProduct(product._id, payload);
      } else {
        await createProduct(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Mechanical Keyboard"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. KB-WLS-99"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Field with Inline + Quick Add Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Category *</label>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  New Category
                </button>
              </div>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName || c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Field with Inline + Quick Add Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Supplier *</label>
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  New Supplier
                </button>
              </div>
              <select
                name="supplierId"
                required
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.companyName || s.company} ({s.contactName || s.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price ($) *</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="129.99"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($) *</label>
              <input
                type="number"
                name="costPrice"
                step="0.01"
                min="0"
                required
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="75.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Stock Quantity *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="42"
                disabled={!!product}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono disabled:opacity-50"
              />
              {product && <p className="text-[10px] text-slate-400 mt-1">Use 'Record Stock' to adjust stock quantity</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock Threshold *</label>
              <input
                type="number"
                name="minStock"
                min="0"
                required
                value={formData.minStock}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Stock Threshold</label>
              <input
                type="number"
                name="maxStock"
                min="0"
                value={formData.maxStock}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="pcs, boxes, pairs"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product features, specs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Category Modal */}
      <CategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Quick Add Supplier Modal */}
      <SupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSuccess={handleSupplierCreated}
      />
    </>
  );
}
