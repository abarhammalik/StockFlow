const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

/**
 * @desc    Get stock movements with filters & pagination (Owner Scoped)
 * @route   GET /api/stock-movements
 * @access  Private
 */
const getStockMovements = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { productId, type, page = 1, limit = 15 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    let query = supabase
      .from('stock_movements')
      .select('*, products:product_id(id, name, sku, price, unit, category_id, supplier_id, categories:category_id(id, name), suppliers:supplier_id(id, company))', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (productId) query = query.eq('product_id', productId);
    if (type) query = query.eq('type', type);

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + limitNum - 1);

    const { data: movements, count, error } = await query;
    if (error) throw error;

    const total = count !== null ? count : (movements || []).length;
    const data = (movements || []).map((m) => {
      const formatted = formatRecord(m);
      if (formatted.products) {
        formatted.productId = formatRecord(formatted.products);
        if (formatted.productId.categories) {
          formatted.productId.categoryId = formatRecord(formatted.productId.categories);
        }
        if (formatted.productId.suppliers) {
          formatted.productId.supplierId = formatRecord(formatted.productId.suppliers);
        }
      }
      return formatted;
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record new stock movement (IN, OUT, RETURN, ADJUSTMENT) (Owner Scoped)
 * @route   POST /api/stock-movements
 * @access  Private
 */
const recordStockMovement = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { productId, type, quantity, reason, reference, newPrice, newCostPrice } = req.body;

    const pId = productId || req.body._id;
    const qty = parseInt(quantity, 10);

    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', pId)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (prodErr || !product) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied' });
    }

    const previousStock = product.quantity;
    let newStock = previousStock;

    if (type === 'IN' || type === 'RETURN') {
      newStock = previousStock + qty;
    } else if (type === 'OUT') {
      if (previousStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Available stock is ${previousStock} ${product.unit}, requested OUT: ${qty} ${product.unit}`,
        });
      }
      newStock = previousStock - qty;
    } else if (type === 'ADJUSTMENT') {
      newStock = qty;
    }

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock movement would result in negative inventory quantity',
      });
    }

    const productUpdates = { quantity: newStock };
    if (newPrice !== undefined && newPrice !== null && !isNaN(parseFloat(newPrice)) && parseFloat(newPrice) >= 0) {
      productUpdates.price = parseFloat(newPrice);
    }
    if (newCostPrice !== undefined && newCostPrice !== null && !isNaN(parseFloat(newCostPrice)) && parseFloat(newCostPrice) >= 0) {
      productUpdates.cost_price = parseFloat(newCostPrice);
    }

    await supabase.from('products').update(productUpdates).eq('id', product.id).eq('owner_id', ownerId);

    const { data: movement, error: moveErr } = await supabase
      .from('stock_movements')
      .insert({
        owner_id: ownerId,
        product_id: product.id,
        type,
        quantity: qty,
        previous_stock: previousStock,
        new_stock: newStock,
        reason: reason || `${type} Movement Record`,
        reference: reference || `REF-${Date.now().toString().slice(-6)}`,
      })
      .select('*, products:product_id(name, sku, price, unit)')
      .single();

    if (moveErr) throw moveErr;

    const formatted = formatRecord(movement);
    if (formatted.products) {
      formatted.productId = formatRecord(formatted.products);
    }

    res.status(201).json({
      success: true,
      message: `Stock movement (${type}) recorded successfully`,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stock movements for a specific product (Owner Scoped)
 * @route   GET /api/stock-movements/product/:productId
 * @access  Private
 */
const getProductMovements = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', req.params.productId)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    const data = (movements || []).map(formatRecord);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockMovements,
  recordStockMovement,
  getProductMovements,
};
