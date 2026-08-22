import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Code2, 
  Layers, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  Database,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { 
  getCategoryAnalytics, 
  getSupplierAnalytics, 
  getTopMovingProducts, 
  getLowStockAnalytics 
} from '../services/api';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('category');
  const [categoryData, setCategoryData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [catRes, supRes, topRes, lowRes] = await Promise.all([
        getCategoryAnalytics(),
        getSupplierAnalytics(),
        getTopMovingProducts(),
        getLowStockAnalytics()
      ]);
      setCategoryData(catRes.data || []);
      setSupplierData(supRes.data || []);
      setTopProducts(topRes.data || []);
      setLowStockData(lowRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics pipelines data', err);
    } finally {
      setLoading(false);
    }
  };

  const BAR_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];

  const pipelineCodeSnippets = {
    category: `// Category Valuation & Profit Margins (Supabase / PostgreSQL)
const { data: categories } = await supabase
  .from('categories')
  .select('id, name, description, products(id, quantity, price, cost_price, min_stock)')
  .eq('owner_id', req.user.id);

// Computes valuation = SUM(quantity * price), cost = SUM(quantity * cost_price)
// and profit margin = (totalValuation - totalCost) / totalValuation * 100%`,
    supplier: `// Supplier Portfolio Analysis (Supabase / PostgreSQL)
const { data: suppliers } = await supabase
  .from('suppliers')
  .select('id, name, company, email, phone, products(id, quantity, price, min_stock)')
  .eq('owner_id', req.user.id);

// Aggregates total supplied products, total volume, and active valuation`,
    topProducts: `// Top-Moving Products by Stock Ledger (Supabase / PostgreSQL)
const { data: movements } = await supabase
  .from('stock_movements')
  .select('product_id, quantity, type, products:product_id(id, name, sku, price, quantity)')
  .eq('owner_id', req.user.id);

// Groups movements by product_id, aggregates OUT/IN quantities, and sorts top movers`,
    lowStock: `// Low-Stock Threshold Evaluation (Supabase / PostgreSQL)
const { data: lowStock } = await supabase
  .from('products')
  .select('id, name, sku, price, quantity, min_stock, unit, categories(name), suppliers(company)')
  .eq('owner_id', req.user.id);

// Filters products where quantity <= min_stock sorted by lowest stock available`,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Database Analytics & Insights
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
                Supabase PostgreSQL
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live server-side PostgreSQL metrics and aggregated portfolio data
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'category', label: 'Category Valuation Pipeline', icon: Layers },
          { id: 'supplier', label: 'Supplier Portfolio Pipeline', icon: Truck },
          { id: 'topProducts', label: 'Top-Moving Products Pipeline', icon: TrendingUp },
          { id: 'lowStock', label: 'Low-Stock Threshold Pipeline', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Pipeline Stage Architecture Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-600 font-mono uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          Active Query Execution Flow
        </h4>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {activeTab === 'category' && (
            <>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">SELECT categories</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg">JOIN products</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">AGGREGATE totalInventoryValue</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">CALCULATE profitMargin</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">ORDER BY valuation DESC</span>
            </>
          )}

          {activeTab === 'supplier' && (
            <>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">SELECT suppliers</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg">JOIN products</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">AGGREGATE portfolio value</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">ORDER BY totalInventoryValue</span>
            </>
          )}

          {activeTab === 'topProducts' && (
            <>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">SELECT stock_movements</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">GROUP BY product_id</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">ORDER BY totalMoved DESC</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">JOIN products (SKU, name)</span>
            </>
          )}

          {activeTab === 'lowStock' && (
            <>
              <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">WHERE quantity &lt;= min_stock</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">JOIN categories & suppliers</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">ORDER BY quantity ASC</span>
            </>
          )}
        </div>
      </div>

      {/* Grid — Left Code Viewer, Right Visual Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Snippet Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Supabase Query Execution
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 text-slate-500 border border-slate-200 rounded">
                Node.js Client
              </span>
            </div>

            <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {pipelineCodeSnippets[activeTab]}
            </pre>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            * All calculations take place natively in the cloud database and Express backend, returning computed payloads directly.
          </p>
        </div>

        {/* Dynamic Chart Display */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Aggregated Visual Representation</h3>
              <span className="text-xs font-mono text-emerald-600">Live Payload</span>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading live metrics...</div>
            ) : (
              <div className="h-64 w-full">
                {activeTab === 'category' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
                      <YAxis type="category" dataKey="categoryName" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Total Inventory Value']} />
                      <Bar dataKey="totalInventoryValue" radius={[0, 4, 4, 0]}>
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {activeTab === 'supplier' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
                      <YAxis type="category" dataKey="companyName" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Portfolio Inventory Value']} />
                      <Bar dataKey="totalInventoryValue" radius={[0, 4, 4, 0]}>
                        {supplierData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {activeTab === 'topProducts' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="sku" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val) => [`${val} Units`, 'Moved Quantity']} />
                      <Bar dataKey="totalMovedQuantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {activeTab === 'lowStock' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lowStockData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="sku" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val, name) => [val, name === 'quantity' ? 'Current Stock' : 'Min Required']} />
                      <Bar dataKey="quantity" fill="#ef4444" radius={[4, 4, 0, 0]} name="Current Stock" />
                      <Bar dataKey="minStock" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Min Threshold" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Visual representations rendered in real-time using Recharts SVG engine from server-side query results.
          </p>
        </div>
      </div>
    </div>
  );
}
