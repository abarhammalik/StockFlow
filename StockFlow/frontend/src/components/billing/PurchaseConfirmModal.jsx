import React from 'react';
import Modal from '../ui/Modal';
import { ShoppingCart, CheckCircle2, DollarSign, User, CreditCard, ShieldCheck } from 'lucide-react';

export default function PurchaseConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  customerName, 
  customerPhone, 
  cartItemsCount, 
  grandTotal, 
  paymentMethod, 
  loading = false 
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Final Purchase" size="md">
      <div className="space-y-5 py-2">
        {/* Header Icon */}
        <div className="flex items-center gap-3.5 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Final Order Verification</h4>
            <p className="text-xs text-slate-500">Please review order totals before generating invoice</p>
          </div>
        </div>

        {/* Purchase Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-sans font-semibold">Customer Name:</span>
            <span className="font-bold text-slate-800 font-sans">{customerName || 'N/A'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="font-sans font-semibold">Mobile Number:</span>
            <span className="font-bold text-indigo-600">{customerPhone || 'N/A'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="font-sans font-semibold">Total Items in Cart:</span>
            <span className="font-bold text-slate-800">{cartItemsCount} items</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="font-sans font-semibold">Payment Method:</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
              {paymentMethod}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span className="font-sans">Grand Total:</span>
            <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          * Clicking 'Yes, Process Purchase' will atomically deduct stock in MongoDB & issue tax receipt.
        </p>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel / Edit Cart
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Processing Sale...' : 'Yes, Process Purchase'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
