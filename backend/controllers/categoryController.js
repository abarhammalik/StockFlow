const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

/**
 * @desc    Get all categories with aggregated product count and stock value (Owner Scoped)
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    // Fetch categories and their associated products for owner
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*, products(id, quantity, price, min_stock)')
      .eq('owner_id', ownerId)
      .order('name', { ascending: true });

    if (error) throw error;

    const data = (categories || []).map((cat) => {
      const formatted = formatRecord(cat);
      const prods = cat.products || [];

      const productCount = prods.length;
      let totalStockQuantity = 0;
      let totalInventoryValue = 0;
      let lowStockCount = 0;

      for (const p of prods) {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const minStock = Number(p.min_stock) || 5;

        totalStockQuantity += qty;
        totalInventoryValue += qty * price;
        if (qty <= minStock) {
          lowStockCount += 1;
        }
      }

      formatted.productCount = productCount;
      formatted.totalStockQuantity = totalStockQuantity;
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
 * @desc    Get single category by ID (Owner Scoped)
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategoryById = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or access denied' });
    }

    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('owner_id', ownerId);

    const formatted = formatRecord(category);
    formatted.productCount = productCount || 0;

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category (Owner Scoped)
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { name, description = '', status = 'active' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const cleanName = name.trim();
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('owner_id', ownerId)
      .ilike('name', cleanName)
      .maybeSingle();

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists in your workspace' });
    }

    const { data: category, error: insertErr } = await supabase
      .from('categories')
      .insert({
        owner_id: ownerId,
        name: cleanName,
        description,
        status,
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: formatRecord(category),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (Owner Scoped)
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { name, description, status } = req.body;

    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or access denied' });
    }

    if (name && name.toLowerCase().trim() !== category.name.toLowerCase()) {
      const { data: nameExists } = await supabase
        .from('categories')
        .select('id')
        .eq('owner_id', ownerId)
        .ilike('name', name.trim())
        .maybeSingle();

      if (nameExists && nameExists.id !== category.id) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists in your workspace' });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const { data: updatedCategory, error: updateErr } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: formatRecord(updatedCategory),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category (Owner Scoped)
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or access denied' });
    }

    // Check if products exist in this category (Owner Scoped)
    const { count: productsInCat } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('owner_id', ownerId);

    if (productsInCat && productsInCat > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category '${category.name}' because it contains ${productsInCat} product(s). Please reassign or delete products first.`,
      });
    }

    const { error } = await supabase.from('categories').delete().eq('id', req.params.id).eq('owner_id', ownerId);
    if (error) throw error;

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
