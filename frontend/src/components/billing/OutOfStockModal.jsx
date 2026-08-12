import React from 'react';
import Modal from '../ui/Modal';
import { AlertTriangle, PackageX, XCircle } from 'lucide-react';

export default function OutOfStockModal({ isOpen, onClose, productInfo }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inventory Stock Alert" size="md">
      <div className="space-y-5 text-center py-2">
        {/* Animated Warning Icon */}
        <div className="w-16 h-16 bg-rose-100 border-2 border-rose-300 rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-md">
          <PackageX className="w-9 h-9" />
        </div>

        {/* Warning Content */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
            Item Out of Stock!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {productInfo?.name ? (
              <>
                <strong className="text-slate-800 font-bold">'{productInfo.name}'</strong> ({productInfo.sku || 'SKU'}) has no remaining inventory available in MongoDB.
              </>
            ) : (
              'The requested quantity exceeds the current available inventory limit in MongoDB.'
            )}
          </p>
        </div>

        {/* Details Box */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 font-mono text-left space-y-1">
          <div className="flex justify-between">
            <span className="font-bold">Available Stock:</span>
            <span className="font-extrabold text-rose-600">
              {productInfo?.availableStock ?? 0} {productInfo?.unit || 'pcs'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Requested Quantity:</span>
            <span className="font-extrabold text-rose-600">
              {productInfo?.requestedQty ?? 1} {productInfo?.unit || 'pcs'}
            </span>
          </div>
          <div className="pt-1.5 border-t border-rose-200 text-[11px] text-rose-600 font-sans">
            ⚠️ Stock cannot go below zero (0). Please restock product before completing bill.
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition shadow-md shadow-rose-200"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
