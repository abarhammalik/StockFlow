const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

/**
 * @desc    Get paginated & filtered products with populated references
 * @route   GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build MongoDB query filter using query operators ($or, $regex, $gt, $gte, $lt, $lte, $expr)
    const filter = {};

    // Text / Regex Search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex }
      ];
    }

    // Category & Supplier Filters
    if (category) filter.categoryId = category;
    if (supplier) filter.supplierId = supplier;
    if (status) filter.status = status;

    // Price Range Filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    // Quantity Range Filters
    if (minQty !== undefined || maxQty !== undefined) {
      filter.quantity = {};
      if (minQty !== undefined) filter.quantity.$gte = parseInt(minQty, 10);
      if (maxQty !== undefined) filter.quantity.$lte = parseInt(maxQty, 10);
    }

    // Dynamic Stock Status Filters ($expr evaluation)
    if (stockStatus) {
      if (stockStatus === 'out_of_stock') {
        filter.quantity = 0;
      } else if (stockStatus === 'low_stock') {
        filter.$expr = { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minStock'] }] };
      } else if (stockStatus === 'healthy') {
        filter.$expr = { $and: [{ $gt: ['$quantity', '$minStock'] }, { $lt: ['$quantity', '$maxStock'] }] };
      } else if (stockStatus === 'overstocked') {
        filter.$expr = { $gte: ['$quantity', '$maxStock'] };
      }
    }

    // Sort options
    const sort = {};
    const validSortFields = ['name', 'sku', 'price', 'quantity', 'createdAt', 'updatedAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sort[field] = sortOrder === 'asc' ? 1 : -1;

    // Query Execution with Population, Skip, Limit
    const products = await Product.find(filter)
      .populate('categoryId', 'name description status')
      .populate('supplierId', 'name company email phone')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID with history & references
 * @route   GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name description status')
      .populate('supplierId', 'name company email phone address');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related stock movement ledger entries
    const movements = await StockMovement.find({ productId: product._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        movements
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, description, categoryId, supplierId, price, costPrice, quantity = 0, minStock = 5, maxStock = 100, unit = 'pcs', status = 'active' } = req.body;

    // Check category & supplier existence
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Specified Category does not exist' });
    }

    const supplierExists = await Supplier.findById(supplierId);
    if (!supplierExists) {
      return res.status(400).json({ success: false, message: 'Specified Supplier does not exist' });
    }

    // Check SKU uniqueness
    const skuExists = await Product.findOne({ sku: sku.toUpperCase() });
    if (skuExists) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      description,
      categoryId,
      supplierId,
      price,
      costPrice,
      quantity,
      minStock,
      maxStock,
      unit,
      status
    });

    // Auto-create initial stock movement if quantity > 0
    if (quantity > 0) {
      await StockMovement.create({
        productId: product._id,
        type: 'IN',
        quantity,
        previousStock: 0,
        newStock: quantity,
        reason: 'Initial Product Stock Creation',
        reference: `INIT-${product.sku}`
      });
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name')
      .populate('supplierId', 'company');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { sku, categoryId, supplierId } = req.body;

    if (sku && sku.toUpperCase() !== product.sku) {
      const skuCheck = await Product.findOne({ sku: sku.toUpperCase() });
      if (skuCheck) {
        return res.status(400).json({ success: false, message: 'SKU already in use by another product' });
      }
    }

    if (categoryId) {
      const catExists = await Category.findById(categoryId);
      if (!catExists) return res.status(400).json({ success: false, message: 'Invalid Category ID' });
    }

    if (supplierId) {
      const supExists = await Supplier.findById(supplierId);
      if (!supExists) return res.status(400).json({ success: false, message: 'Invalid Supplier ID' });
    }

    // Preserve stock quantity changes through stock movement API instead of direct overwrite where possible
    const updatedData = { ...req.body };
    if (sku) updatedData.sku = sku.toUpperCase();

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    })
      .populate('categoryId', 'name')
      .populate('supplierId', 'company');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product & associated movements
 * @route   DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await StockMovement.deleteMany({ productId: product._id });
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product and associated stock movements deleted successfully'
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
  deleteProduct
};
