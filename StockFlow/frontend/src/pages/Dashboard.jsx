import React, { useEffect, useState } from 'react';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Layers, 
  Truck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight,
  Plus,
  RefreshCw,
  ShoppingCart,
  FileCheck2,
  Receipt,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { getDashboardSummary, getTopMovingProducts } from '../services/api';
import { StockBadge, MovementBadge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';

export default function Dashboard({ onAddProduct, onRecordStock, onViewProduct }) {
  const [data, setData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const [sumRes, topRes] = await Promise.all([
        getDashboardSummary(),
        getTopMovingProducts()
      ]);
      setData(sumRes.data);
      setTopProducts(topRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics from MongoDB');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time Socket.IO listeners
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      fetchDashboardData();
    };

    socket.on('INVENTORY_UPDATED', handleRealtimeUpdate);
    socket.on('SALE_CREATED', handleRealtimeUpdate);

    return () => {
      socket.off('INVENTORY_UPDATED', handleRealtimeUpdate);
      socket.off('SALE_CREATED', handleRealtimeUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <CardSkeleton count={5} />
        <div className="h-64 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-rose-700">Database API Error</h3>
          <p className="text-xs text-rose-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition shadow-md shadow-rose-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const lowStockAlerts = data?.lowStockAlerts || [];
  const recentMovements = data?.recentMovements || [];
  const recentSales = data?.recentSales || [];

  // Stock Health Donut Data
  const stockHealthData = [
    { name: 'Healthy Stock', value: summary.healthyStockCount || 0, color: '#10b981' },
    { name: 'Low Stock', value: summary.lowStockCount || 0, color: '#f59e0b' },
    { name: 'Out of Stock', value: summary.outOfStockCount || 0, color: '#ef4444' },
    { name: 'Overstocked', value: summary.overstockedCount || 0, color: '#6366f1' },
  ].filter((item) => item.value > 0);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* FEATURE 6: Welcome Header & Quick Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Welcome Back, Admin</h2>
            <span className="p-1 bg-amber-100 text-amber-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            {formattedDate}
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/billing')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            POS Billing
          </button>

          <button
            onClick={onAddProduct}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Add Product
          </button>

          <button
            onClick={() => navigate('/purchase-orders')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            Create PO
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 rounded-xl transition"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Live Sales Revenue */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-md">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono">
              ${(summary.todayRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-indigo-100 font-mono mt-1">
              {summary.todayOrdersCount || 0} completed orders today
            </p>
          </div>
        </div>

        {/* Total Inventory Value Card (Green) */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Total Inventory Value</span>
            <div className="p-2.5 bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono tracking-tight">
              ${(summary.totalInventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-100 font-medium font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Potential Profit: ${((summary.potentialProfit || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total SKU Items</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-mono">
              {summary.totalProducts || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {summary.totalQuantity || 0} total units in stock
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Low Stock SKUs</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-600 tracking-tight font-mono">
              {summary.lowStockCount || 0}
            </h3>
            <p className="text-[11px] text-amber-600/80 font-medium mt-1">Requires reorder attention</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Out of Stock</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-rose-600 tracking-tight font-mono">
              {summary.outOfStockCount || 0}
            </h3>
            <p className="text-[11px] text-rose-500 font-medium mt-1">0 available quantity</p>
          </div>
        </div>
      </div>

      {/* Middle Grid: FEATURE 4 (Stock Health Donut Chart) & FEATURE 2 (Top Best Selling Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FEATURE 4: Stock Health Distribution Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-600" />
                Stock Health Breakdown
              </h3>
              <p className="text-xs text-slate-400">Proportion of Healthy, Low, and Out-of-Stock SKUs</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {stockHealthData.length === 0 ? (
              <p className="text-xs text-slate-400">No inventory health data found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stockHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* FEATURE 2: Top Fast Moving / Best Selling Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Fast-Moving Top Products
              </h3>
              <p className="text-xs text-slate-400">Highest quantity activity & velocity in inventory</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No product movement data recorded.</p>
            ) : (
              topProducts.slice(0, 5).map((item, index) => {
                const productName = item.name || item.product?.name || 'Product Item';
                const sku = item.sku || item.product?.sku || 'SKU';
                const qtyOut = item.outQuantity ?? item.totalMovedQuantity ?? 0;
                const unitStr = item.unit || 'pcs';

                return (
                  <div key={item._id || index} className="py-2.5 flex items-center justify-between hover:bg-slate-50 transition px-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800">{productName}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{sku}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-indigo-600">{qtyOut} {unitStr} moved</span>
                      <p className="text-[10px] text-slate-400">{item.movementCount || 1} transactions</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: FEATURE 1 (Recent Live Sales Feed) & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FEATURE 1: Recent Sales Activity Live Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Recent Sales Live Stream
              </h3>
              <p className="text-xs text-slate-400">Latest completed customer checkout transactions</p>
            </div>

            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentSales.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No recent sales completed yet.</p>
            ) : (
              recentSales.map((s) => (
                <div key={s._id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 transition px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-600 font-mono">{s.invoiceNumber}</h4>
                      <p className="text-[11px] text-slate-600">{s.customerName}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-800">${s.grandTotal.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts Action Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Low-Stock Alerts
              </h3>
              <p className="text-xs text-slate-400">SKUs below minimum threshold requiring restock</p>
            </div>

            <button
              onClick={() => navigate('/products')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Inventory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {lowStockAlerts.length === 0 ? (
              <p className="py-8 text-center text-slate-400">All products have healthy inventory levels!</p>
            ) : (
              lowStockAlerts.slice(0, 5).map((prod) => (
                <div key={prod._id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 transition px-2 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800">{prod.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{prod.sku} • {prod.categoryName || 'General'}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {prod.quantity} {prod.unit} left
                    </span>
                    <button
                      onClick={() => onRecordStock(prod)}
                      className="px-2.5 py-1 font-sans text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
