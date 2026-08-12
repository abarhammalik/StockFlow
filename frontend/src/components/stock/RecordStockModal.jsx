import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { recordStockMovement, getProducts } from '../../services/api';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, SlidersHorizontal, Tag } from 'lucide-react';

export default function RecordStockModal({ isOpen, onClose, selectedProduct = null, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN',
    quantity: 1,
    reason: '',
    reference: '',
    newPrice: '',
    newCostPrice: '',
  });

  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadProductsList();
      setError(null);
      if (selectedProduct) {
        setFormData({
          productId: selectedProduct._id,
          type: 'IN',
          quantity: 1,
          reason: '',
          reference: '',
          newPrice: selectedProduct.price ?? '',
          newCostPrice: selectedProduct.costPrice ?? '',
        });
        setCurrentProduct(selectedProduct);
      } else {
        setFormData({
          productId: '',
          type: 'IN',
          quantity: 1,
          reason: '',
          reference: '',
          newPrice: '',
          newCostPrice: '',
        });
        setCurrentProduct(null);
      }
    }
  }, [isOpen, selectedProduct]);

  const loadProductsList = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products list', err);
    }
  };

  const handleProductChange = (e) => {
    const id = e.target.value;
    const prod = products.find((p) => p._id === id);
    setFormData((prev) => ({
      ...prev,
      productId: id,
      newPrice: prod?.price ?? '',
      newCostPrice: prod?.costPrice ?? '',
    }));
    setCurrentProduct(prod || null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate real-time stock outcome
  const calculateNewStock = () => {
    if (!currentProduct) return 0;
    const prev = currentProduct.quantity || 0;
    const qty = parseInt(formData.quantity, 10) || 0;

    if (formData.type === 'IN' || formData.type === 'RETURN') {
      return prev + qty;
    } else if (formData.type === 'OUT') {
      return prev - qty;
    } else if (formData.type === 'ADJUSTMENT') {
      return qty;
    }
    return prev;
  };

  const newStockCalculated = calculateNewStock();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const qty = parseInt(formData.quantity, 10) || 0;

    if (formData.type === 'OUT' && currentProduct && currentProduct.quantity < qty) {
      setError(`Cannot dispatch ${qty} ${currentProduct.unit}! Current available stock is only ${currentProduct.quantity}.`);
      setLoading(false);
      return;
    }

    try {
      await recordStockMovement({
        productId: formData.productId,
        type: formData.type,
        quantity: qty,
        reason: formData.reason,
        reference: formData.reference,
        newPrice: formData.newPrice !== '' ? parseFloat(formData.newPrice) : undefined,
        newCostPrice: formData.newCostPrice !== '' ? parseFloat(formData.newCostPrice) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record stock movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Inventory Movement & Pricing" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product *</label>
          <select
            name="productId"
            required
            value={formData.productId}
            onChange={handleProductChange}
            disabled={!!selectedProduct}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku}) — Current Stock: {p.quantity} {p.unit} | ${p.price}
              </option>
            ))}
          </select>
        </div>

        {/* Movement Type Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Movement Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { type: 'IN', label: 'Stock IN', icon: ArrowDownLeft, color: 'hover:border-emerald-400 text-emerald-600' },
              { type: 'OUT', label: 'Stock OUT', icon: ArrowUpRight, color: 'hover:border-rose-400 text-rose-600' },
              { type: 'RETURN', label: 'Return', icon: RefreshCw, color: 'hover:border-purple-400 text-purple-600' },
              { type: 'ADJUSTMENT', label: 'Audit / Adj.', icon: SlidersHorizontal, color: 'hover:border-amber-400 text-amber-600' },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSelected = formData.type === btn.type;
              return (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: btn.type }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : `bg-slate-50 border-slate-200 text-slate-700 ${btn.color}`
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Input & Real-time Balance Calculation Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {formData.type === 'ADJUSTMENT' ? 'New Target Stock Level *' : 'Quantity *'}
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              value={formData.quantity}
              onChange={handleChange}
              placeholder="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Real-Time Balance Math Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Stock Balance Projection</span>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Current:</span>
              <span className="text-slate-700">{currentProduct ? currentProduct.quantity : 0} {currentProduct?.unit || ''}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono font-bold pt-1 border-t border-slate-200">
              <span className="text-indigo-600">New Total:</span>
              <span className="text-indigo-600">{newStockCalculated} {currentProduct?.unit || ''}</span>
            </div>
          </div>
        </div>

        {/* Price Update Option Section */}
        <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>Update Product Prices (Optional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Selling Price (₹)</label>
              <div className="relative">
                <span className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 text-[10px] font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="newPrice"
                  value={formData.newPrice}
                  onChange={handleChange}
                  placeholder={currentProduct ? currentProduct.price : 'Selling Price'}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cost Price (₹)</label>
              <div className="relative">
                <span className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 text-[10px] font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="newCostPrice"
                  value={formData.newCostPrice}
                  onChange={handleChange}
                  placeholder={currentProduct ? currentProduct.costPrice : 'Cost Price'}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reason & Reference Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Supplier Shipment #992"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Code</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="e.g. PO-2026-001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.productId}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Confirm Restock & Price'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
