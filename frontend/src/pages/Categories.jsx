import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { getCategories, deleteCategory } from '../services/api';
import CategoryModal from '../components/categories/CategoryModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget._id);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalValuation = categories.reduce((sum, c) => sum + (c.totalInventoryValue || 0), 0);
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Product Categories</h2>
          <p className="text-xs text-slate-400">Organize stock catalog with aggregated real-time analytics</p>
        </div>

        <button
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Categories</span>
            <h3 className="text-2xl font-bold text-slate-800 font-mono mt-1">{categories.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Catalog Products</span>
            <h3 className="text-2xl font-bold text-slate-800 font-mono mt-1">{totalProducts} SKUs</h3>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Aggregated Catalog Value</span>
            <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-1">₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
            <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">₹</span>
          </div>
        </div>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : error ? (
        <div className="p-6 text-center text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition group">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition">
                    {c.categoryName || c.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingCategory(c); setIsModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {c.categoryDescription || c.description || 'No description available'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Products</span>
                  <strong className="text-slate-700">{c.productCount || 0}</strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Valuation</span>
                  <strong className="text-emerald-600">₹{(c.totalInventoryValue || 0).toLocaleString('en-IN')}</strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Low Stock</span>
                  <strong className={(c.lowStockCount || 0) > 0 ? 'text-amber-500' : 'text-slate-400'}>
                    {c.lowStockCount || 0}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={fetchCategories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category '${deleteTarget?.categoryName || deleteTarget?.name}'? Note that categories with linked products cannot be deleted.`}
        loading={deleteLoading}
      />
    </div>
  );
}
