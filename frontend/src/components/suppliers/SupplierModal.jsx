import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { createSupplier, updateSupplier } from '../../services/api';

export default function SupplierModal({ isOpen, onClose, supplier = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.contactName || supplier.name || '',
          company: supplier.companyName || supplier.company || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          status: supplier.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          address: '',
          status: 'active'
        });
      }
      setError(null);
    }
  }, [isOpen, supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (supplier) {
        result = await updateSupplier(supplier._id, formData);
      } else {
        result = await createSupplier(formData);
      }
      onSuccess(result?.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={supplier ? 'Edit Supplier' : 'Add New Supplier'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              placeholder="Apex Tech Components Ltd."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="David Vance"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="orders@apextech.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 234-8901"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Office / Warehouse Address</label>
          <textarea
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, City, State..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
