import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl mt-0.5">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 text-[13px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2 text-[13px] font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-md shadow-rose-200 disabled:opacity-50">
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
