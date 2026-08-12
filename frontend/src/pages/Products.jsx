import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowLeftRight, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Package,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { getProducts, getCategories, getSuppliers, deleteProduct } from '../services/api';
import { exportToCSV } from '../utils/csvExport';
import { StockBadge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import ProductModal from '../components/products/ProductModal';
import RecordStockModal from '../components/stock/RecordStockModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import socket from '../services/socket';

export default function Products({ onViewDetails }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isRecordStockOpen, setIsRecordStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        supplier: selectedSupplier || undefined,
        stockStatus: selectedStockStatus || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10
      };

      const res = await getProducts(params);
      setProducts(res.data || []);
      setPagination(res.pagination || { total: 0, pages: 1, limit: 10 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleInventoryUpdate = () => {
      fetchProducts();
    };

    socket.on('INVENTORY_UPDATED', handleInventoryUpdate);
    return () => {
      socket.off('INVENTORY_UPDATED', handleInventoryUpdate);
    };
  }, [search, selectedCategory, selectedSupplier, selectedStockStatus, sortBy, sortOrder, page]);

  useEffect(() => {
    loadFiltersDropdowns();
  }, []);

  const loadFiltersDropdowns = async () => {
    try {
      const [catRes, supRes] = await Promise.all([getCategories(), getSuppliers()]);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error('Failed to load category/supplier dropdowns', err);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSupplier('');
    setSelectedStockStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteTarget._id);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenStockRecord = (p) => {
    setStockProduct(p);
    setIsRecordStockOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Controls & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Products Management</h2>
          <p className="text-xs text-slate-400">Search, filter, edit, and record inventory levels in real-time</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(products.map(p => ({
              Name: p.name,
              SKU: p.sku,
              Category: p.categoryId?.name || '',
              Price: p.price,
              CostPrice: p.costPrice,
              Quantity: p.quantity,
              Unit: p.unit,
              Status: p.stockStatus
            })), 'stockflow-products.csv')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, SKU..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.categoryName || c.name}</option>
            ))}
          </select>

          {/* Supplier Filter */}
          <select
            value={selectedSupplier}
            onChange={(e) => { setSelectedSupplier(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.companyName || s.company}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="quantity-asc">Stock: Low to High</option>
            <option value="quantity-desc">Stock: High to Low</option>
          </select>
        </div>

        {/* Stock Status Pills & Clear Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
            {[
              { id: '', label: 'All' },
              { id: 'healthy', label: 'Healthy' },
              { id: 'low_stock', label: 'Low Stock' },
              { id: 'out_of_stock', label: 'Out of Stock' },
              { id: 'overstocked', label: 'Overstocked' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => { setSelectedStockStatus(btn.id); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedStockStatus === btn.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {(search || selectedCategory || selectedSupplier || selectedStockStatus) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Product Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-500">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-600">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or add your first product to the inventory database.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-200"
            >
              + Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-right">Price (₹)</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {products.map((p) => {
                  const percent = Math.min(100, Math.round((p.quantity / (p.maxStock || 100)) * 100));
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition group">
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span 
                            onClick={() => onViewDetails && onViewDetails(p)}
                            className="font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
                          >
                            {p.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              {p.sku}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">₹{p.costPrice} cost</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {p.categoryId?.name || 'Unassigned'}
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {p.supplierId?.company || 'Unassigned'}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                        ₹{p.price.toFixed(2)}
                      </td>

                      {/* Stock Level & Visual Bar */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="font-bold text-slate-700">{p.quantity} {p.unit}</span>
                            <span className="text-slate-400">Min: {p.minStock}</span>
                          </div>
                          <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                p.quantity === 0 ? 'bg-rose-500' :
                                p.quantity <= p.minStock ? 'bg-amber-400' : 'bg-emerald-400'
                              }`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Pill Badge */}
                      <td className="py-3.5 px-4">
                        <StockBadge status={p.stockStatus} />
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStockRecord(p)}
                            title="Record Stock Movement"
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewDetails && onViewDetails(p)}
                            title="View Stock Ledger & Analytics"
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            title="Delete Product"
                            className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-700">{products.length}</strong> of <strong className="text-slate-700">{pagination.total}</strong> products (Page {pagination.page} of {pagination.pages})
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-600">Page {page}</span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        onSuccess={fetchProducts}
      />

      {/* Record Stock Movement Modal */}
      <RecordStockModal
        isOpen={isRecordStockOpen}
        onClose={() => setIsRecordStockOpen(false)}
        selectedProduct={stockProduct}
        onSuccess={fetchProducts}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete '${deleteTarget?.name}' (${deleteTarget?.sku})? This action will permanently remove the product and its stock history.`}
        loading={deleteLoading}
      />
    </div>
  );
}
