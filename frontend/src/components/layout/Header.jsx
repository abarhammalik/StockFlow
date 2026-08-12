import React from 'react';
import { Menu, Plus, ArrowLeftRight, RefreshCw, Search } from 'lucide-react';

export default function Header({ title, subtitle, onMenuClick, onAddProductClick, onRecordStockClick, onOpenSearch, onRefresh, refreshing = false }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden hover:bg-slate-100 transition">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition"
        >
          <Search className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Search...</span>
          <kbd className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Ctrl+K</kbd>
        </button>

        {onRefresh && (
          <button onClick={onRefresh} disabled={refreshing} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200 disabled:opacity-50" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        {onRecordStockClick && (
          <button onClick={onRecordStockClick} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition shadow-sm">
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Record Stock</span>
          </button>
        )}
        {onAddProductClick && (
          <button onClick={onAddProductClick} className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] rounded-xl shadow-md shadow-indigo-200 transition">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>
    </header>
  );
}
