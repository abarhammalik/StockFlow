import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { createCategory, updateCategory } from '../../services/api';

export default function CategoryModal({ isOpen, onClose, category = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.categoryName || category.name || '',
          description: category.categoryDescription || category.description || '',
          status: category.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'active'
        });
      }
      setError(null);
    }
  }, [isOpen, category]);

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
      if (category) {
        result = await updateCategory(category._id, formData);
      } else {
        result = await createCategory(formData);
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
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Add New Category'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Microcontrollers & IoT"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief summary of items in this category..."
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
            {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
