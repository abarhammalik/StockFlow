import React from 'react';
import Modal from '../ui/Modal';
import { Printer, Heart, CheckCircle2, Store, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';

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
                  Your order has been processed. Stock levels updated live in database.
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

        {/* Printable Official Invoice Card */}
        <div id="printable-invoice" className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Business & Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="StockFlow"
                className="w-12 h-12 rounded-2xl object-contain shadow-md shadow-indigo-100"
              />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">STOCKFLOW RETAIL POS</h2>
                <p className="text-xs text-slate-500 font-medium">Official Tax Receipt & Stock Voucher</p>
              </div>
            </div>

            <div className="text-right font-mono sm:text-right">
              <span className="text-xs font-bold text-indigo-600 block">{sale.invoiceNumber}</span>
              <span className="text-[11px] text-slate-400">{formattedDate}</span>
            </div>
          </div>

          {/* Customer & Payment Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Customer Details:</span>
              <p className="font-bold text-slate-800 text-sm">{sale.customerName}</p>
              <p className="text-slate-600 font-mono">Phone: {sale.customerPhone}</p>
              {sale.customerEmail && <p className="text-slate-500">Email: {sale.customerEmail}</p>}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Payment Summary:</span>
              <p className="font-bold text-slate-800">Method: {sale.paymentMethod}</p>
              <p className="font-semibold text-emerald-600">Status: {sale.paymentStatus}</p>
              {sale.notes && <p className="text-slate-500 italic">Notes: {sale.notes}</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2">SKU</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(sale.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-sans font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-2 text-slate-500 text-[11px]">{item.sku}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">₹{(Number(item.price) || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">₹{(Number(item.subtotal) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown & Total */}
          <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="space-y-2 text-[11px] text-slate-500 max-w-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Store Policy & Terms:
                </p>
                <p>• Goods once sold can be returned/exchanged within 7 days with original receipt.</p>
                <p>• This is an authorized computer-generated commercial tax invoice.</p>
              </div>

              {/* Thank You Note */}
              <p className="text-center font-bold text-indigo-600 pt-1">
                ❤️ Thank you for your business! Have a wonderful day!
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Cart Subtotal:</span>
                <span>₹{(Number(sale.subtotal) || 0).toFixed(2)}</span>
              </div>
              {Number(sale.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({sale.discountRate}%):</span>
                  <span>-₹{(Number(sale.discountAmount) || 0).toFixed(2)}</span>
                </div>
              )}
              {Number(sale.taxAmount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax ({sale.taxRate}%):</span>
                  <span>+₹{(Number(sale.taxAmount) || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t-2 border-slate-300">
                <span>Grand Total:</span>
                <span className="text-indigo-600">₹{(Number(sale.grandTotal) || 0).toFixed(2)}</span>
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
