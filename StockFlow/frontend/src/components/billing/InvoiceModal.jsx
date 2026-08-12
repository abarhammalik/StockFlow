import React from 'react';
import Modal from '../ui/Modal';
import { Printer, Heart, CheckCircle2, Store, Phone, Mail, FileText, Sparkles, ShieldCheck } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, sale }) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Official Tax Bill #${sale.invoiceNumber}`} size="lg">
      <div className="space-y-6">
        {/* Prominent Thank You & Purchase Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden print:hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <Heart className="w-6 h-6 fill-white text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  Thank You for Your Purchase! 🎉
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5 font-medium">
                  Your order has been processed. Stock levels updated live in MongoDB.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-emerald-50 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print Official Bill</span>
            </button>
          </div>
        </div>

        {/* Printable Tax Bill Document Card */}
        <div id="printable-bill" className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* Store Logo & Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">StockFlow Retail Store</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">128 Technology Park, Innovation Suite #402</p>
              <p className="text-[11px] text-slate-400 font-mono">GSTIN / TAX ID: 27AAAAA0000A1Z5 | Support: (800) 555-STOCK</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">RETAIL TAX INVOICE</span>
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold font-mono text-sm rounded-lg border border-indigo-200">
                {sale.invoiceNumber}
              </div>
              <p className="text-slate-500 font-mono text-xs mt-1">{formattedDate}</p>
            </div>
          </div>

          {/* Customer Billed-To Box & Payment Status Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Billed To Customer</span>
              <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{sale.customerName}</h4>
              <p className="text-slate-600 font-mono mt-0.5">Mobile: {sale.customerPhone}</p>
              {sale.customerEmail && <p className="text-slate-500">{sale.customerEmail}</p>}
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Payment Status</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{sale.paymentMethod} — PAID & VERIFIED</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Transaction ID: TXN-{sale.invoiceNumber.replace('INV-', '')}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Item Description</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 px-3 font-mono text-indigo-600 font-semibold">{item.sku}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation Box */}
          <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="space-y-2 text-[11px] text-slate-500 max-w-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Store Policy & Terms:
                </p>
                <p>• Goods once sold can be returned/exchanged within 7 days with original receipt.</p>
                <p>• This is a computer-generated tax invoice verified by MongoDB database.</p>
              </div>

              {/* Thank You Note */}
              <p className="text-center font-bold text-indigo-600 pt-1">
                ❤️ Thank you for your business! Have a wonderful day!
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Cart Subtotal:</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({sale.discountRate}%):</span>
                  <span>-${sale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax ({sale.taxRate}%):</span>
                  <span>+${sale.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t-2 border-slate-300">
                <span>Grand Total:</span>
                <span className="text-indigo-600">${sale.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Footer Visual */}
          <div className="border-t border-slate-200 pt-4 text-center space-y-1 font-mono">
            <div className="tracking-[0.4em] font-extrabold text-slate-400 text-sm">
              ||| | |||| | ||| |||| | ||| |||| | |||
            </div>
            <p className="text-[10px] text-slate-400">*{sale.invoiceNumber}*</p>
          </div>

        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </button>
        </div>
      </div>
    </Modal>
  );
}
