const { supabase } = require('../config/supabase');
const { formatProduct, formatRecord } = require('../utils/supabaseHelpers');

/**
 * @desc    Get paginated & filtered products with populated references (Owner Scoped)
 * @route   GET /api/products
 * @access  Private
 */
const getProducts = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const {
      search,
      category,
      supplier,
      stockStatus,
      status,
      minPrice,
      maxPrice,
      minQty,
      maxQty,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let query = supabase
      .from('products')
      .select('*, categories:category_id(id, name, description, status), suppliers:supplier_id(id, name, company, email, phone, address)', { count: 'exact' })
      .eq('owner_id', ownerId);

    // Text / ILike Search
    if (search) {
      const cleanSearch = search.replace(/[%,]/g, '');
      query = query.or(`name.ilike.%${cleanSearch}%,sku.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
    }

    // Category & Supplier Filters
    if (category) query = query.eq('category_id', category);
    if (supplier) query = query.eq('supplier_id', supplier);
    if (status) query = query.eq('status', status);

    // Price Range Filters
    if (minPrice !== undefined && minPrice !== '') query = query.gte('price', parseFloat(minPrice));
    if (maxPrice !== undefined && maxPrice !== '') query = query.lte('price', parseFloat(maxPrice));

    // Quantity Range Filters
    if (minQty !== undefined && minQty !== '') query = query.gte('quantity', parseInt(minQty, 10));
    if (maxQty !== undefined && maxQty !== '') query = query.lte('quantity', parseInt(maxQty, 10));

    // Stock Status
    if (stockStatus === 'out_of_stock') {
      query = query.eq('quantity', 0);
    }

    // Sorting
    const sortFieldMap = {
      name: 'name',
      sku: 'sku',
      price: 'price',
      quantity: 'quantity',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      created_at: 'created_at',
      updated_at: 'updated_at',
    };
    const dbSortField = sortFieldMap[sortBy] || 'created_at';
    query = query.order(dbSortField, { ascending: sortOrder.toLowerCase() === 'asc' });

    // Pagination
    query = query.range(skip, skip + limitNum - 1);

    const { data: rawProducts, count, error } = await query;
    if (error) throw error;

    let products = (rawProducts || []).map(formatProduct);

    // In-memory filter for complex relational/calculated stockStatus if needed
    if (stockStatus === 'low_stock') {
      products = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock);
    } else if (stockStatus === 'overstocked') {
      products = products.filter((p) => p.maxStock > 0 && p.quantity >= p.maxStock);
    } else if (stockStatus === 'healthy') {
      products = products.filter((p) => p.quantity > p.minStock && (p.maxStock === 0 || p.quantity < p.maxStock));
    }

    const total = count !== null ? count : products.length;

    res.json({
      success: true,
      data: products,
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
 * @desc    Get single product by ID with history & references (Owner Scoped)
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProductById = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*, categories:category_id(id, name, description, status), suppliers:supplier_id(id, name, company, email, phone, address)')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied.' });
    }

    // Fetch related stock movement ledger entries (Owner Scoped)
    const { data: rawMovements } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', req.params.id)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(20);

    const formattedProduct = formatProduct(product);
    const movements = (rawMovements || []).map(formatRecord);

    res.json({
      success: true,
      data: {
        ...formattedProduct,
        movements,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product (Owner Scoped)
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const {
      name,
      sku,
      description,
      categoryId,
      supplierId,
      price,
      costPrice,
      quantity = 0,
      minStock = 5,
      maxStock = 100,
      unit = 'pcs',
      status = 'active',
    } = req.body;

    if (!name || !sku || price === undefined || costPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, SKU, price, and cost price are required' });
    }

    // Verify Category belongs to authenticated user if provided
    if (categoryId) {
      const { data: categoryExists } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Specified Category does not exist in your workspace' });
      }
    }

    // Verify Supplier belongs to authenticated user if provided
    if (supplierId) {
      const { data: supplierExists } = await supabase
        .from('suppliers')
        .select('id')
        .eq('id', supplierId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (!supplierExists) {
        return res.status(400).json({ success: false, message: 'Specified Supplier does not exist in your workspace' });
      }
    }

    // Check SKU uniqueness within THIS user's inventory workspace
    const { data: skuExists } = await supabase
      .from('products')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('sku', sku.toUpperCase().trim())
      .maybeSingle();

    if (skuExists) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists in your inventory' });
    }

    const { data: product, error: insertErr } = await supabase
      .from('products')
      .insert({
        owner_id: ownerId,
        name: name.trim(),
        sku: sku.toUpperCase().trim(),
        description: description || '',
        category_id: categoryId || null,
        supplier_id: supplierId || null,
        price: parseFloat(price),
        cost_price: parseFloat(costPrice),
        quantity: parseInt(quantity, 10) || 0,
        min_stock: parseInt(minStock, 10) || 5,
        max_stock: parseInt(maxStock, 10) || 100,
        unit: unit || 'pcs',
        status: status || 'active',
      })
      .select('*, categories:category_id(id, name), suppliers:supplier_id(id, company)')
      .single();

    if (insertErr) throw insertErr;

    // Auto-create initial stock movement if quantity > 0
    if (quantity > 0) {
      await supabase.from('stock_movements').insert({
        owner_id: ownerId,
        product_id: product.id,
        type: 'IN',
        quantity: parseInt(quantity, 10),
        previous_stock: 0,
        new_stock: parseInt(quantity, 10),
        reason: 'Initial Product Stock Creation',
        reference: `INIT-${product.sku}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: formatProduct(product),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details (Owner Scoped)
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied' });
    }

    const { sku, categoryId, supplierId, name, description, price, costPrice, quantity, minStock, maxStock, unit, status } = req.body;

    if (sku && sku.toUpperCase().trim() !== product.sku) {
      const { data: skuCheck } = await supabase
        .from('products')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('sku', sku.toUpperCase().trim())
        .maybeSingle();

      if (skuCheck && skuCheck.id !== product.id) {
        return res.status(400).json({ success: false, message: 'SKU already in use by another product in your inventory' });
      }
    }

    if (categoryId) {
      const { data: catExists } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (!catExists) return res.status(400).json({ success: false, message: 'Invalid Category ID for your workspace' });
    }

    if (supplierId) {
      const { data: supExists } = await supabase
        .from('suppliers')
        .select('id')
        .eq('id', supplierId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (!supExists) return res.status(400).json({ success: false, message: 'Invalid Supplier ID for your workspace' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (sku !== undefined) updates.sku = sku.toUpperCase().trim();
    if (description !== undefined) updates.description = description;
    if (categoryId !== undefined) updates.category_id = categoryId || null;
    if (supplierId !== undefined) updates.supplier_id = supplierId || null;
    if (price !== undefined) updates.price = parseFloat(price);
    if (costPrice !== undefined) updates.cost_price = parseFloat(costPrice);
    if (quantity !== undefined) updates.quantity = parseInt(quantity, 10);
    if (minStock !== undefined) updates.min_stock = parseInt(minStock, 10);
    if (maxStock !== undefined) updates.max_stock = parseInt(maxStock, 10);
    if (unit !== undefined) updates.unit = unit;
    if (status !== undefined) updates.status = status;

    const { data: updatedProduct, error: updateErr } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .select('*, categories:category_id(id, name), suppliers:supplier_id(id, company)')
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: formatProduct(updatedProduct),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product & associated movements (Owner Scoped)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied' });
    }

    await supabase.from('stock_movements').delete().eq('product_id', req.params.id).eq('owner_id', ownerId);
    const { error } = await supabase.from('products').delete().eq('id', req.params.id).eq('owner_id', ownerId);
    if (error) throw error;

    res.json({
      success: true,
      message: 'Product and associated stock movements deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
