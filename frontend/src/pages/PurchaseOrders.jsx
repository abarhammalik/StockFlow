import React, { useEffect, useState } from 'react';
import { Truck, Plus, CheckCircle2, Clock, ChevronLeft, ChevronRight, PackageCheck } from 'lucide-react';
import axios from 'axios';
import { getSuppliers, getProducts } from '../services/api';
import Modal from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [costPrice, setCostPrice] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/purchase-orders');
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load POs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [sRes, pRes] = await Promise.all([getSuppliers(), getProducts()]);
      setSuppliers(sRes.data || []);
      setProducts(pRes.data || []);
    } catch (err) {
      console.error('Failed to load PO dropdowns', err);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedProduct) return;

    setSubmitting(true);
    const sup = suppliers.find((s) => s._id === selectedSupplier);
    const prod = products.find((p) => p._id === selectedProduct);

    try {
      await axios.post('/api/purchase-orders', {
        supplierId: sup._id,
        supplierName: sup.companyName || sup.company,
        items: [
          {
            productId: prod._id,
            costPrice: parseFloat(costPrice),
            quantity: parseInt(quantity, 10),
          },
        ],
      });
      setIsCreateOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create PO');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReceived = async (poId) => {
    try {
      await axios.put(`/api/purchase-orders/${poId}/status`, { status: 'RECEIVED' });
      fetchOrders();
    } catch (err) {
      alert('Failed to update PO status');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Supplier Purchase Orders (PO)</h2>
          <p className="text-xs text-slate-400">Create purchase orders for vendors and auto-restock catalog inventory on receipt</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Truck className="w-10 h-10 text-slate-300 mx-auto" />
            <p>No purchase orders created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4">PO Number</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Items Count</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {orders.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{po.poNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{po.supplierName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{po.items?.length || 0} SKUs</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">₹{po.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {po.status !== 'RECEIVED' && (
                        <button
                          onClick={() => handleMarkReceived(po._id)}
                          className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200 flex items-center gap-1 ml-auto"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Mark Received & Restock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Supplier Purchase Order" size="md">
        <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Supplier *</label>
            <select
              required
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.companyName || s.company}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Product to Restock *</label>
            <select
              required
              value={selectedProduct}
              onChange={(e) => {
                const prodId = e.target.value;
                setSelectedProduct(prodId);
                const prod = products.find((p) => p._id === prodId);
                if (prod && prod.costPrice !== undefined) {
                  setCostPrice(prod.costPrice);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) — Cost: ₹{p.costPrice || 0} | Stock: {p.quantity}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Cost Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
