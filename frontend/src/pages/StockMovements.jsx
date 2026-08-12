import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Plus, Filter, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { getStockMovements } from '../services/api';
import { MovementBadge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import RecordStockModal from '../components/stock/RecordStockModal';
import socket from '../services/socket';

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await getStockMovements({
        type: selectedType || undefined,
        page,
        limit: 15
      });
      setMovements(res.data || []);
      setPagination(res.pagination || { total: 0, pages: 1, limit: 15 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();

    const handleInventoryUpdate = () => {
      fetchMovements();
    };

    socket.on('INVENTORY_UPDATED', handleInventoryUpdate);
    return () => {
      socket.off('INVENTORY_UPDATED', handleInventoryUpdate);
    };
  }, [selectedType, page]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Record Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Stock Movements Ledger</h2>
          <p className="text-xs text-slate-400">Complete immutable history of inventory receipts, sales, returns, and adjustments</p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Movement
        </button>
      </div>

      {/* Movement Type Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Type:
          </span>
          {[
            { id: '', label: 'All Transactions' },
            { id: 'IN', label: 'Stock IN (Receipts)' },
            { id: 'OUT', label: 'Stock OUT (Sales)' },
            { id: 'RETURN', label: 'Returns' },
            { id: 'ADJUSTMENT', label: 'Adjustments' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => { setSelectedType(btn.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedType === btn.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-500">
          Total Entries: <strong className="text-slate-800">{pagination.total}</strong>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={10} cols={7} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-500">
            {error}
          </div>
        ) : movements.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto" />
            <p>No stock movement transactions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Movement Type</th>
                  <th className="py-3.5 px-4 text-right">Qty</th>
                  <th className="py-3.5 px-4 text-right">Previous → New Stock</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-700">
                        {m.productId?.name || 'Deleted Product'}
                      </div>
                      <span className="text-[10px] text-indigo-600 font-mono">
                        {m.productId?.sku} ({m.productId?.categoryId?.name || 'Category'})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <MovementBadge type={m.type} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 text-sm">
                      {m.type === 'OUT' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="text-slate-400">{m.previousStock}</span>
                      <span className="text-slate-300 mx-1.5">→</span>
                      <strong className="text-emerald-600">{m.newStock}</strong>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {m.reason || 'Standard Ledger Entry'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 text-[11px]">
                      {m.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Page {pagination.page} of {pagination.pages} ({pagination.total} records)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <RecordStockModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={fetchMovements}
      />
    </div>
  );
}
