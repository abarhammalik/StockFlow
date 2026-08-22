import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import socket from '../../services/socket';

export const showToast = (message, type = 'info', title = '') => {
  const event = new CustomEvent('stockflow-toast', {
    detail: {
      id: Date.now() + Math.random(),
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'),
      message,
      type,
    },
  });
  window.dispatchEvent(event);
};

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
              type: 'warning',
            });
          }
        });
      }
    };

    const handleCustomToast = (e) => {
      if (e.detail) {
        addToast(e.detail);
      }
    };

    socket.on('INVENTORY_UPDATED', handleInventoryUpdated);
    window.addEventListener('stockflow-toast', handleCustomToast);

    return () => {
      socket.off('INVENTORY_UPDATED', handleInventoryUpdated);
      window.removeEventListener('stockflow-toast', handleCustomToast);
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
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`text-white border rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-slide-up ${
              isSuccess
                ? 'bg-slate-900 border-emerald-500/40'
                : isError
                ? 'bg-slate-900 border-rose-500/40'
                : isWarning
                ? 'bg-slate-900 border-amber-500/40'
                : 'bg-slate-900 border-indigo-500/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 border ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isError
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isError ? (
                  <AlertCircle className="w-4 h-4" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4
                  className={`text-xs font-bold font-mono ${
                    isSuccess
                      ? 'text-emerald-400'
                      : isError
                      ? 'text-rose-400'
                      : isWarning
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                  }`}
                >
                  {toast.title}
                </h4>
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
        );
      })}
    </div>
  );
}
