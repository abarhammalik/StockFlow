import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';
import socket from '../../services/socket';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleInventoryUpdated = (event) => {
      if (event.type === 'SALE_COMPLETED' && event.updatedProducts) {
        event.updatedProducts.forEach((prod) => {
          if (prod.isLowStock) {
            addToast({
              id: Date.now() + Math.random(),
              title: 'Low Stock Alert!',
              message: `'${prod.name}' is low in stock! Remaining: ${prod.newStock} units.`,
            });
          }
        });
      }
    };

    socket.on('INVENTORY_UPDATED', handleInventoryUpdated);
    return () => {
      socket.off('INVENTORY_UPDATED', handleInventoryUpdated);
    };
  }, []);

  const addToast = (toast) => {
    setToasts((prev) => [toast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(toast.id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-slate-900 text-white border border-amber-500/40 rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-slide-up"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-400 font-mono">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
