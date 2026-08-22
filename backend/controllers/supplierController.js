const { supabase } = require('../config/supabase');
const { formatRecord, formatProduct } = require('../utils/supabaseHelpers');

/**
 * @desc    Get all suppliers with aggregated metrics (Owner Scoped)
 * @route   GET /api/suppliers
 * @access  Private
 */
const getSuppliers = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*, products(id, quantity, price, min_stock)')
      .eq('owner_id', ownerId)
      .order('company', { ascending: true });

    if (error) throw error;

    const data = (suppliers || []).map((sup) => {
      const formatted = formatRecord(sup);
      const prods = sup.products || [];

      const productCount = prods.length;
      let totalQuantitySupplied = 0;
      let totalInventoryValue = 0;
      let lowStockCount = 0;

      for (const p of prods) {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const minStock = Number(p.min_stock) || 5;

        totalQuantitySupplied += qty;
        totalInventoryValue += qty * price;
        if (qty <= minStock) {
          lowStockCount += 1;
        }
      }

      formatted.productCount = productCount;
      formatted.totalQuantitySupplied = totalQuantitySupplied;
      formatted.totalInventoryValue = totalInventoryValue;
      formatted.lowStockCount = lowStockCount;
      delete formatted.products;

      return formatted;
    });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get supplier by ID with product portfolio details (Owner Scoped)
 * @route   GET /api/suppliers/:id
 * @access  Private
 */
const getSupplierById = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found or access denied' });
    }

    const { data: rawProducts } = await supabase
      .from('products')
      .select('id, name, sku, price, quantity, min_stock, unit, status, categories:category_id(id, name)')
      .eq('supplier_id', supplier.id)
      .eq('owner_id', ownerId);

    const formattedSupplier = formatRecord(supplier);
    const products = (rawProducts || []).map(formatProduct);

    formattedSupplier.productCount = products.length;
    formattedSupplier.products = products;

    res.json({
      success: true,
      data: formattedSupplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new supplier (Owner Scoped)
 * @route   POST /api/suppliers
 * @access  Private
 */
const createSupplier = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { name, company, email, phone = '', address = '', status = 'active' } = req.body;

    if (!name || !company || !email) {
      return res.status(400).json({ success: false, message: 'Contact name, company name, and email are required' });
    }

    const { data: supplier, error: insertErr } = await supabase
      .from('suppliers')
      .insert({
        owner_id: ownerId,
        name: name.trim(),
        company: company.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        status,
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: formatRecord(supplier),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update supplier (Owner Scoped)
 * @route   PUT /api/suppliers/:id
 * @access  Private
 */
const updateSupplier = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { name, company, email, phone, address, status } = req.body;

    const { data: supplier } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found or access denied' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (company !== undefined) updates.company = company.trim();
    if (email !== undefined) updates.email = email.toLowerCase().trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();
    if (status !== undefined) updates.status = status;

    const { data: updatedSupplier, error: updateErr } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: formatRecord(updatedSupplier),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete supplier (Owner Scoped)
 * @route   DELETE /api/suppliers/:id
 * @access  Private
 */
const deleteSupplier = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: supplier } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found or access denied' });
    }

    const { count: productsCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplier.id)
      .eq('owner_id', ownerId);

    if (productsCount && productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier '${supplier.company}' because ${productsCount} product(s) are assigned to it.`,
      });
    }

    const { error } = await supabase.from('suppliers').delete().eq('id', req.params.id).eq('owner_id', ownerId);
    if (error) throw error;

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
