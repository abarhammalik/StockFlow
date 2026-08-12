const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

/**
 * @desc    Get stock movements with filters & pagination
 * @route   GET /api/stock-movements
 */
const getStockMovements = async (req, res, next) => {
  try {
    const { productId, type, page = 1, limit = 15 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (productId) filter.productId = productId;
    if (type) filter.type = type;

    const movements = await StockMovement.find(filter)
      .populate({
        path: 'productId',
        select: 'name sku price unit categoryId supplierId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'supplierId', select: 'company' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StockMovement.countDocuments(filter);

    res.json({
      success: true,
      data: movements,
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
 * @desc    Record new stock movement (IN, OUT, RETURN, ADJUSTMENT)
 * @route   POST /api/stock-movements
 */
const recordStockMovement = async (req, res, next) => {
  try {
    const { productId, type, quantity, reason, reference, newPrice, newCostPrice } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.quantity;
    let newStock = previousStock;

    if (type === 'IN' || type === 'RETURN') {
      newStock = previousStock + quantity;
    } else if (type === 'OUT') {
      if (previousStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Available stock is ${previousStock} ${product.unit}, requested OUT: ${quantity} ${product.unit}`
        });
      }
      newStock = previousStock - quantity;
    } else if (type === 'ADJUSTMENT') {
      newStock = quantity; // Specified adjustment target value
    }

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock movement would result in negative inventory quantity'
      });
    }

    // Update Product stock quantity
    product.quantity = newStock;

    // Optionally update selling price and cost price when restocking!
    if (newPrice !== undefined && newPrice !== null && !isNaN(parseFloat(newPrice)) && parseFloat(newPrice) >= 0) {
      product.price = parseFloat(newPrice);
    }

    if (newCostPrice !== undefined && newCostPrice !== null && !isNaN(parseFloat(newCostPrice)) && parseFloat(newCostPrice) >= 0) {
      product.costPrice = parseFloat(newCostPrice);
    }

    await product.save();

    // Create immutable stock movement record
    const movement = await StockMovement.create({
      productId: product._id,
      type,
      quantity,
      previousStock,
      newStock,
      reason: reason || `${type} Movement Record`,
      reference: reference || `REF-${Date.now().toString().slice(-6)}`
    });

    const populatedMovement = await StockMovement.findById(movement._id).populate({
      path: 'productId',
      select: 'name sku price unit'
    });

    res.status(201).json({
      success: true,
      message: `Stock movement (${type}) recorded successfully`,
      data: populatedMovement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stock movements for a specific product
 * @route   GET /api/stock-movements/product/:productId
 */
const getProductMovements = async (req, res, next) => {
  try {
    const movements = await StockMovement.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockMovements,
  recordStockMovement,
  getProductMovements
};
