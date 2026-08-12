import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Code2, 
  Layers, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
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
    category: `// Category Valuation Pipeline ($lookup, $unwind, $group, $project, $sort)
await Product.aggregate([
  {
    $lookup: {
      from: 'categories',
      localField: 'categoryId',
      foreignField: '_id',
      as: 'category'
    }
  },
  { $unwind: '$category' },
  {
    $group: {
      _id: '$category._id',
      categoryName: { $first: '$category.name' },
      productCount: { $sum: 1 },
      totalQuantity: { $sum: '$quantity' },
      totalInventoryValue: { $sum: { $multiply: ['$quantity', '$price'] } }
    }
  },
  { $sort: { totalInventoryValue: -1 } }
]);`,
    supplier: `// Supplier Analysis Pipeline ($lookup, $unwind, $group, $project)
await Product.aggregate([
  {
    $lookup: {
      from: 'suppliers',
      localField: 'supplierId',
      foreignField: '_id',
      as: 'supplier'
    }
  },
  { $unwind: '$supplier' },
  {
    $group: {
      _id: '$supplier._id',
      companyName: { $first: '$supplier.company' },
      productCount: { $sum: 1 },
      totalInventoryValue: { $sum: { $multiply: ['$quantity', '$price'] } }
    }
  },
  { $sort: { totalInventoryValue: -1 } }
]);`,
    topProducts: `// Top Moving Products Pipeline ($group, $sort, $limit, $lookup)
await StockMovement.aggregate([
  {
    $group: {
      _id: '$productId',
      totalMovedQuantity: { $sum: '$quantity' },
      movementCount: { $sum: 1 }
    }
  },
  { $sort: { totalMovedQuantity: -1 } },
  { $limit: 6 },
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product'
    }
  },
  { $unwind: '$product' }
]);`,
    lowStock: `// Low-Stock Evaluation Pipeline ($match using $expr)
await Product.aggregate([
  {
    $match: {
      $expr: { $lte: ['$quantity', '$minStock'] }
    }
  },
  {
    $lookup: {
      from: 'categories',
      localField: 'categoryId',
      foreignField: '_id',
      as: 'category'
    }
  },
  { $unwind: '$category' },
  { $sort: { quantity: 1 } }
]);`
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
              MongoDB Aggregation Showcase
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
                Judging Showcase
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live server-side MongoDB aggregation pipelines computing metrics on Community Server
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
          { id: 'lowStock', label: 'Low-Stock $expr Pipeline', icon: AlertTriangle },
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
          Active Pipeline Stage Sequence
        </h4>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {activeTab === 'category' && (
            <>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">$lookup (categories)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg">$unwind</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">$group (totalInventoryValue)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">$project (profitMargin)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">$sort</span>
            </>
          )}

          {activeTab === 'supplier' && (
            <>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">$lookup (suppliers)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg">$unwind</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">$group (portfolio metrics)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">$sort</span>
            </>
          )}

          {activeTab === 'topProducts' && (
            <>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">$group (sum quantity)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">$sort</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">$limit 6</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">$lookup (products)</span>
            </>
          )}

          {activeTab === 'lowStock' && (
            <>
              <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">$match ($expr: quantity &lt;= minStock)</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">$lookup</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">$sort</span>
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
                MongoDB Mongoose Aggregation Query
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 text-slate-500 border border-slate-200 rounded">
                Node.js Driver
              </span>
            </div>

            <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {pipelineCodeSnippets[activeTab]}
            </pre>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            * All calculations take place natively inside MongoDB server memory, returning computed payloads directly to Express.
          </p>
        </div>

        {/* Dynamic Chart Display */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Aggregated Visual Representation</h3>
              <span className="text-xs font-mono text-emerald-600">Live Payload</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={
                    activeTab === 'category' ? categoryData :
                    activeTab === 'supplier' ? supplierData :
                    activeTab === 'topProducts' ? topProducts : lowStockData
                  } 
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey={
                      activeTab === 'category' ? 'categoryName' :
                      activeTab === 'supplier' ? 'companyName' :
                      activeTab === 'topProducts' ? 'name' : 'name'
                    } 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Bar 
                    dataKey={
                      activeTab === 'category' ? 'totalInventoryValue' :
                      activeTab === 'supplier' ? 'totalInventoryValue' :
                      activeTab === 'topProducts' ? 'totalMovedQuantity' : 'quantity'
                    } 
                    radius={[6, 6, 0, 0]}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
