import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  UserCheck, 
  CreditCard, 

  CheckCircle2, 
  AlertTriangle,
  Receipt,
  UserPlus,
  RefreshCw,
  Phone,
  User,
  Mail
} from 'lucide-react';
import { getProducts, getCustomerByPhone, createSale } from '../services/api';
import InvoiceModal from '../components/billing/InvoiceModal';
import OutOfStockModal from '../components/billing/OutOfStockModal';
import PurchaseConfirmModal from '../components/billing/PurchaseConfirmModal';
import socket from '../services/socket';

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Out of Stock Modal Popup state
  const [isOutOfStockOpen, setIsOutOfStockOpen] = useState(false);
  const [outOfStockInfo, setOutOfStockInfo] = useState(null);

  // Customer Information
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCustomerFound, setIsCustomerFound] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Customer Name input & search handler
  const handleCustomerNameChange = async (nameVal) => {
    setCustomerName(nameVal);
    if (!nameVal || nameVal.trim().length === 0) {
      setCustomerSuggestions([]);
      setShowNameSuggestions(false);
      setIsCustomerFound(false);
      return;
    }

    setCustomerLoading(true);
    try {
      const res = await getCustomers({ search: nameVal.trim(), limit: 10 });
      const matches = res.data || [];
      setCustomerSuggestions(matches);
      setShowNameSuggestions(matches.length > 0);

      // Auto-fill mobile number if exact match or exact single match
      const exactMatch = matches.find(
        (c) => c.name && c.name.trim().toLowerCase() === nameVal.trim().toLowerCase()
      );
      if (exactMatch) {
        setCustomerPhone(exactMatch.phone || '');
        setCustomerEmail(exactMatch.email || '');
        setIsCustomerFound(true);
      } else if (matches.length === 1 && nameVal.trim().length >= 3 && matches[0].name.toLowerCase().startsWith(nameVal.trim().toLowerCase())) {
        // If only 1 customer matches prefix
        setCustomerPhone(matches[0].phone || '');
        setCustomerEmail(matches[0].email || '');
        setIsCustomerFound(true);
      } else {
        setIsCustomerFound(false);
      }
    } catch (err) {
      console.error('Failed to fetch customer suggestions', err);
      setCustomerSuggestions([]);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleSelectCustomerSuggestion = (cust) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || '');
    setCustomerEmail(cust.email || '');
    setIsCustomerFound(true);
    setShowNameSuggestions(false);
  };

  // Transaction state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    fetchProductsList();
  }, [search]);

  // Listen for real-time WebSocket inventory updates from other windows
  useEffect(() => {
    const handleInventoryUpdate = (event) => {
      console.log('[WebSocket] Inventory update event received in Billing:', event);
      fetchProductsList();
    };

    socket.on('INVENTORY_UPDATED', handleInventoryUpdate);
    return () => {
      socket.off('INVENTORY_UPDATED', handleInventoryUpdate);
    };
  }, []);

  const fetchProductsList = async () => {
    setLoadingProducts(true);
    try {
      const res = await getProducts({ search: search.trim() || undefined, limit: 50 });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products for POS billing', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const triggerOutOfStockAlert = (name, sku, availableStock, requestedQty, unit) => {
    setOutOfStockInfo({ name, sku, availableStock, requestedQty, unit });
    setIsOutOfStockOpen(true);
  };

  const handleCustomerPhoneLookup = async (phoneVal) => {
    setCustomerPhone(phoneVal);
    if (!phoneVal || phoneVal.trim().length < 8) {
      setIsCustomerFound(false);
      return;
    }

    setCustomerLoading(true);
    try {
      const res = await getCustomerByPhone(phoneVal.trim());
      if (res.data) {
        setCustomerName(res.data.name);
        setCustomerEmail(res.data.email || '');
        setIsCustomerFound(true);
      }
    } catch (err) {
      setIsCustomerFound(false);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Popup if out of stock
    if (product.quantity <= 0) {
      triggerOutOfStockAlert(product.name, product.sku, 0, 1, product.unit);
      return;
    }

    setError(null);
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          triggerOutOfStockAlert(product.name, product.sku, product.quantity, existing.quantity + 1, product.unit);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            costPrice: product.costPrice,
            unit: product.unit,
            maxAvailable: product.quantity,
            quantity: 1,
            subtotal: product.price,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          if (newQty > item.maxAvailable) {
            triggerOutOfStockAlert(item.name, item.sku, item.maxAvailable, newQty, item.unit);
            return item;
          }
          setError(null);
          return { ...item, quantity: newQty, subtotal: newQty * item.price };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setError(null);
  };

  // Financial Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (cartSubtotal * (parseFloat(discountRate) || 0)) / 100;
  const amountAfterDiscount = cartSubtotal - discountAmount;
  const taxAmount = (amountAfterDiscount * (parseFloat(taxRate) || 0)) / 100;
  const grandTotal = amountAfterDiscount + taxAmount;

  // Step 1: Open confirmation modal (validates inputs first)
  const handleRequestPurchase = () => {
    if (cart.length === 0) {
      setError('Please add at least one product to the cart before completing purchase.');
      return;
    }

    if (!customerPhone || !customerName) {
      setError('Customer Name and Phone Number are required to generate invoice.');
      return;
    }

    setError(null);
    setIsConfirmOpen(true);
  };

  // Step 2: Actually process the sale after user confirms
  const handleConfirmPurchase = async () => {
    setIsConfirmOpen(false);
    setSubmitting(true);
    setError(null);

    const payload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      discountRate: parseFloat(discountRate) || 0,
      taxRate: parseFloat(taxRate) || 0,
      paymentMethod,
    };

    try {
      const res = await createSale(payload);
      setCompletedSale(res.data);
      setIsInvoiceOpen(true);

      // Reset Form & Cart
      setCart([]);
      setCustomerPhone('');
      setCustomerName('');
      setCustomerEmail('');
      setIsCustomerFound(false);
      setCustomerSuggestions([]);
      setShowNameSuggestions(false);
      setDiscountRate(0);
      setTaxRate(0);
      fetchProductsList(); // Refresh products
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('stock')) {
        triggerOutOfStockAlert('Cart Item', '', 0, 1, 'pcs');
      }
      setError(err.message || 'Failed to complete purchase transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Point of Sale & Billing (POS)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Live MongoDB Sync
            </span>
          </h2>
          <p className="text-xs text-slate-400">Process customer orders, auto-generate invoices, and deduct stock live</p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition"
          >
            Clear Cart ({cart.length})
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Main Billing Layout — Left Column: Product Search & Selection Grid, Right Column: Cart & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Catalog Product Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Products Grid Selection */}
            {loadingProducts ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading catalog...</div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No matching products found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const inCart = cart.find((item) => item.productId === p._id);
                  const isOut = p.quantity <= 0;
                  return (
                    <div
                      key={p._id}
                      onClick={() => {
                        if (isOut) {
                          triggerOutOfStockAlert(p.name, p.sku, 0, 1, p.unit);
                        } else {
                          handleAddToCart(p);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        isOut
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                          : inCart
                          ? 'bg-indigo-50/50 border-indigo-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-semibold border border-indigo-100 shrink-0">
                            {p.sku}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.categoryId?.name || 'Category'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="font-mono font-extrabold text-slate-800">₹{p.price.toFixed(2)}</span>
                        <span className={`font-mono text-[11px] font-bold ${isOut ? 'text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-full' : 'text-slate-500'}`}>
                          {isOut ? 'Out of Stock' : `${p.quantity} ${p.unit} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Customer Info, Shopping Cart & Billing Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer Information Input Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Customer Name (First) with Autocomplete Suggestions */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Customer Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
                    onFocus={() => {
                      if (customerName.trim().length >= 1 && customerSuggestions.length > 0) {
                        setShowNameSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowNameSuggestions(false), 150);
                    }}
                    placeholder="Enter customer name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                  />
                  {customerLoading && (
                    <div className="absolute right-2.5 top-2.5">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Dropdown Suggestions List */}
                {showNameSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                    {customerSuggestions.map((cust) => (
                      <div
                        key={cust._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCustomerSuggestion(cust);
                        }}
                        className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{cust.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{cust.phone}</p>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                          Past Customer
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Mobile Number (Second) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => handleCustomerPhoneLookup(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            {isCustomerFound && (
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Existing customer profile found & auto-filled!
              </p>
            )}
          </div>

          {/* Cart & Billing Checkout Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Cart Items ({cart.length})
                </h3>
                <span className="text-xs font-mono font-bold text-slate-800">₹{cartSubtotal.toFixed(2)}</span>
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Cart is empty. Click any product from catalog to add.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">₹{item.price.toFixed(2)} / {item.unit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="w-16 text-right font-mono font-bold text-xs text-slate-800">
                          ₹{item.subtotal.toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-rose-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Breakdown & Payment Method */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tax / GST (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                </select>
              </div>

              {/* Total Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({discountRate}%):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({taxRate}%):</span>
                    <span>+₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-1.5 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleRequestPurchase}
                disabled={submitting || cart.length === 0}
                className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                {submitting ? 'Processing Purchase...' : 'Confirm Purchase & Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal Popup */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={completedSale}
      />

      {/* Out Of Stock Popup Modal */}
      <OutOfStockModal
        isOpen={isOutOfStockOpen}
        onClose={() => setIsOutOfStockOpen(false)}
        productInfo={outOfStockInfo}
      />

      {/* Purchase Confirmation Popup Modal */}
      <PurchaseConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmPurchase}
        customerName={customerName}
        customerPhone={customerPhone}
        cartItemsCount={cart.length}
        grandTotal={grandTotal}
        paymentMethod={paymentMethod}
        loading={submitting}
      />
    </div>
  );
}
