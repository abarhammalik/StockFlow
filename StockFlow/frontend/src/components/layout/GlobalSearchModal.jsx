import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Search, Package, Receipt, UserCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], sales: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else navigate(location.pathname);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ products: [], sales: [], customers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/sales/global-search?q=${encodeURIComponent(query.trim())}`);
        if (res.data?.data) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Global search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Cross-Collection Search" size="md">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-indigo-600 absolute left-3.5 top-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type product name, invoice #, or customer phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Searching MongoDB collections...</div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {/* Products Matches */}
            {results.products.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Products</span>
                {results.products.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleNavigate('/products')}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-indigo-600" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                        <span className="text-[10px] font-mono text-indigo-600">{p.sku}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <span className="font-bold text-slate-800">${p.price}</span>
                      <p className="text-[10px] text-slate-400">{p.quantity} {p.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sales Matches */}
            {results.sales.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Invoices & Sales</span>
                {results.sales.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleNavigate('/sales')}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-600 font-mono">{s.invoiceNumber}</h4>
                        <p className="text-[10px] text-slate-500">{s.customerName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800">${s.grandTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Customers Matches */}
            {results.customers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Customers</span>
                {results.customers.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleNavigate('/customers')}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-sky-600" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{c.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{c.phone}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600">${c.totalSpent.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {query.length >= 2 && !results.products.length && !results.sales.length && !results.customers.length && (
              <div className="py-8 text-center text-xs text-slate-400">No matching records found across database.</div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
