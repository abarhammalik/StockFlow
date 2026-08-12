import React, { useEffect, useState } from 'react';
import { Search, Receipt, Eye, Calendar, Filter, ChevronLeft, ChevronRight, Download, RotateCcw } from 'lucide-react';
import { getSales } from '../services/api';
import InvoiceModal from '../components/billing/InvoiceModal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { exportToCSV } from '../utils/csvExport';
import socket from '../services/socket';
import axios from 'axios';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  const [selectedSale, setSelectedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [refundingId, setRefundingId] = useState(null);

  const fetchSalesList = async () => {
    setLoading(true);
    try {
      const res = await getSales({
        search: search.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        page,
        limit: 10,
      });
      setSales(res.data || []);
      setPagination(res.pagination || { total: 0, pages: 1, limit: 10 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesList();
  }, [search, paymentMethod, page]);

  // Real-time Socket.IO listener for new sales
  useEffect(() => {
    const handleSaleCreated = () => {
      fetchSalesList();
    };

    socket.on('SALE_CREATED', handleSaleCreated);
    return () => {
      socket.off('SALE_CREATED', handleSaleCreated);
    };
  }, []);

  const handleViewInvoice = (sale) => {
    setSelectedSale(sale);
    setIsInvoiceOpen(true);
  };

  const handleRefund = async (sale) => {
    if (!window.confirm(`Are you sure you want to refund Invoice #${sale.invoiceNumber}? Product stock will be automatically restored to MongoDB.`)) return;

    setRefundingId(sale._id);
    try {
      await axios.post(`/api/sales/${sale._id}/refund`);
      alert(`Invoice #${sale.invoiceNumber} has been refunded & product stock restored!`);
      fetchSalesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to refund sale');
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sales & Invoices History</h2>
          <p className="text-xs text-slate-400">View past sales transactions, customer receipts, and reprint invoices</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Invoice #, Customer name, Phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={paymentMethod}
            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
          >
            <option value="">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="MOBILE_BANKING">Mobile Banking</option>
          </select>

          <div className="flex items-center justify-end text-xs font-mono text-slate-500 gap-3">
            <button
              onClick={() => exportToCSV(sales.map(s => ({
                Invoice: s.invoiceNumber,
                Customer: s.customerName,
                Phone: s.customerPhone,
                Total: s.grandTotal,
                Payment: s.paymentMethod,
                Status: s.saleStatus,
                Date: new Date(s.createdAt).toLocaleString()
              })), 'stockflow-sales.csv')}
              className="px-3 py-1.5 font-sans font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <span>Total Sales: <strong className="text-slate-800">{pagination.total}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Sales Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-500">{error}</div>
        ) : sales.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400">No completed sales records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4 text-right">Items Count</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4">Payment & Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {s.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{s.customerName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{s.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                      {s.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-800">
                      ₹{s.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px] border border-emerald-200">
                          {s.paymentMethod}
                        </span>
                        {s.saleStatus === 'REFUNDED' && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded text-[10px] border border-rose-200">
                            REFUNDED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewInvoice(s)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-100 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>

                        {s.saleStatus !== 'REFUNDED' && (
                          <button
                            onClick={() => handleRefund(s)}
                            disabled={refundingId === s._id}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200 flex items-center gap-1 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Page {pagination.page} of {pagination.pages} ({pagination.total} sales)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
}
