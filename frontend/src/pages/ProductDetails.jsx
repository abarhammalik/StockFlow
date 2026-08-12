import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Package, 

  ArrowLeftRight, 
  Building2, 
  Calendar, 
  Layers, 
  Tag, 
  TrendingUp, 
  Clock,
  Plus
} from 'lucide-react';
import { getProductById } from '../services/api';
import { StockBadge, MovementBadge } from '../components/ui/Badge';
import RecordStockModal from '../components/stock/RecordStockModal';

export default function ProductDetails({ productId, onBack, onRecordStockSuccess }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecordStockOpen, setIsRecordStockOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await getProductById(productId);
      setProduct(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-48 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="h-64 bg-white border border-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center space-y-4">
        <p className="text-rose-500 text-sm">{error || 'Product not found'}</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
          Back to Products List
        </button>
      </div>
    );
  }

  const movements = product.movements || [];

  // Product Movement Analytics Calculations
  const totalReceived = movements
    .filter((m) => m.type === 'IN' || m.type === 'RETURN')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalDispatched = movements
    .filter((m) => m.type === 'OUT')
    .reduce((sum, m) => sum + m.quantity, 0);

  const inventoryValue = product.quantity * product.price;
  const margin = product.price - product.costPrice;
  const marginPercent = product.price > 0 ? ((margin / product.price) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Back Button & Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{product.name}</h2>
              <span className="font-mono text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 font-semibold">
                {product.sku}
              </span>
            </div>
            <p className="text-xs text-slate-400">Deep Inventory History & Aggregation Analytics</p>
          </div>
        </div>

        <button
          onClick={() => setIsRecordStockOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Record Movement
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400">Current Stock Balance</span>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-800 font-mono">{product.quantity} {product.unit}</h3>
            <StockBadge status={product.stockStatus} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Min Threshold: {product.minStock} {product.unit}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400">Total Valuation</span>
          <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-2">₹{inventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Unit Price: ₹{product.price.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400">Unit Cost & Margin</span>
          <h3 className="text-2xl font-bold text-indigo-600 font-mono mt-2">₹{margin.toFixed(2)}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">{marginPercent}% Profit Margin</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400">Movement Analytics</span>
          <div className="mt-2 text-xs font-mono space-y-1">
            <div className="flex justify-between"><span className="text-slate-400">Received (IN):</span><span className="text-emerald-600 font-bold">+{totalReceived}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Dispatched (OUT):</span><span className="text-rose-500 font-bold">-{totalDispatched}</span></div>
          </div>
        </div>
      </div>

      {/* Category & Supplier Metadata Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Category & Classification
          </h4>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Category Name:</span><span className="text-slate-700 font-semibold">{product.categoryId?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Description:</span><span className="text-slate-500">{product.categoryId?.description}</span></div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Assigned Supplier Info
          </h4>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Company:</span><span className="text-slate-700 font-semibold">{product.supplierId?.company}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Contact Person:</span><span className="text-slate-500">{product.supplierId?.name} ({product.supplierId?.email})</span></div>
          </div>
        </div>
      </div>

      {/* Stock Ledger Movement History Timeline Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Immutable Stock Movement Ledger History
          </h3>
          <span className="text-xs text-slate-400 font-mono">{movements.length} Records</span>
        </div>

        {movements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No historic movements recorded for this product yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Previous Stock</th>
                  <th className="py-3 px-4 text-right">New Stock</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <MovementBadge type={m.type} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {m.type === 'OUT' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {m.previousStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {m.newStock}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.reason || 'Transaction Record'}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-600 text-[11px]">
                      {m.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RecordStockModal
        isOpen={isRecordStockOpen}
        onClose={() => setIsRecordStockOpen(false)}
        selectedProduct={product}
        onSuccess={() => {
          fetchDetails();
          if (onRecordStockSuccess) onRecordStockSuccess();
        }}
      />
    </div>
  );
}
