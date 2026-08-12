import React, { useEffect, useState } from 'react';
import { Truck, Plus, Edit, Trash2, Mail, Phone, MapPin, Package, DollarSign } from 'lucide-react';
import { getSuppliers, deleteSupplier } from '../services/api';
import SupplierModal from '../components/suppliers/SupplierModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSupplier(deleteTarget._id);
      setDeleteTarget(null);
      fetchSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to delete supplier');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Suppliers Directory</h2>
          <p className="text-xs text-slate-400">Manage vendor partners, contacts, and inventory distribution</p>
        </div>

        <button
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Supplier Grid Cards */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : error ? (
        <div className="p-6 text-center text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s) => (
            <div key={s._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{s.companyName || s.company}</h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">{s.contactName || s.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingSupplier(s); setIsModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{s.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              {/* Aggregated Metrics Footer */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Products Supplied</span>
                  <strong className="text-slate-700 text-sm">{s.productCount || 0} SKUs</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-sans">Total Portfolio Value</span>
                  <strong className="text-emerald-600 text-sm">${(s.totalInventoryValue || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={editingSupplier}
        onSuccess={fetchSuppliers}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier '${deleteTarget?.companyName || deleteTarget?.company}'? Suppliers with linked active products cannot be deleted.`}
        loading={deleteLoading}
      />
    </div>
  );
}
