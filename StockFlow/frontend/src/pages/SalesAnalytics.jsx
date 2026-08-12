import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, PieChart, ArrowUpRight, Percent, Award, ShieldAlert } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import axios from 'axios';

export default function SalesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesAnalytics();
  }, []);

  const fetchSalesAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/analytics/sales');
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load sales analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {};
  const trends = data?.dailyRevenueTrends || [];
  const paymentBreakdown = data?.paymentMethodBreakdown || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sales & Revenue Analytics</h2>
        <p className="text-xs text-slate-400">Server-side MongoDB aggregated financial performance & payment methods</p>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Lifetime Revenue</span>
          <h3 className="text-2xl font-bold text-slate-800 font-mono mt-2">
            ${(summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Completed Orders</span>
          <h3 className="text-2xl font-bold text-slate-800 font-mono mt-2">
            {summary.totalSalesCount || 0} Orders
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Discounts Given</span>
          <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-2">
            ${(summary.totalDiscountsGiven || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tax Collected</span>
          <h3 className="text-2xl font-bold text-indigo-600 font-mono mt-2">
            ${(summary.totalTaxCollected || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Daily Revenue Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Bar dataKey="dailyRevenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
