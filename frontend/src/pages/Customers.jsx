import React, { useEffect, useState } from 'react';
import { Search, UserCheck, Phone, Mail, MapPin, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCustomers } from '../services/api';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  const fetchCustomersList = async () => {
    setLoading(true);
    try {
      const res = await getCustomers({
        search: search.trim() || undefined,
        page,
        limit: 10,
      });
      setCustomers(res.data || []);
      setPagination(res.pagination || { total: 0, pages: 1, limit: 10 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, [search, page]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Customer Management</h2>
          <p className="text-xs text-slate-400">Customer directory with order counts and cumulative spending statistics</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by customer name, phone, email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end text-xs font-mono text-slate-500">
            Total Customers Registered: <strong className="text-slate-800 ml-1">{pagination.total}</strong>
          </div>
        </div>
      </div>

      {/* Main Customers Cards Grid */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : error ? (
        <div className="p-6 text-center text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl">{error}</div>
      ) : customers.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-2">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p>No customer profiles found. Customers will be created automatically upon billing checkout!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{c.name}</h3>
                    <p className="text-xs text-indigo-600 font-mono font-semibold mt-0.5">{c.phone}</p>
                  </div>
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    <UserCheck className="w-4 h-4" />
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.address} {c.city ? `, ${c.city}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aggregated Stats Footer */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Total Orders</span>
                  <strong className="text-slate-700 text-sm">{c.totalOrders || 0} Orders</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Total Spent</span>
                  <strong className="text-emerald-600 text-sm">₹{(c.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white rounded-2xl flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Page {pagination.page} of {pagination.pages} ({pagination.total} customers)</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((prev) => prev + 1)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
