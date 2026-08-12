const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId string parameter
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid MongoDB ObjectId parameter: ${paramName}`,
      });
    }
    next();
  };
};

/**
 * Validate Product Request Body
 */
const validateProductInput = (req, res, next) => {
  const { name, sku, categoryId, supplierId, price, costPrice, quantity, minStock, maxStock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Product name is required');
  }

  if (!sku || typeof sku !== 'string' || sku.trim() === '') {
    errors.push('Product SKU is required');
  }

  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    errors.push('Valid Category ID reference is required');
  }

  if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
    errors.push('Valid Supplier ID reference is required');
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price must be a positive number');
  }

  if (costPrice === undefined || typeof costPrice !== 'number' || costPrice < 0) {
    errors.push('Cost price must be a positive number');
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
    errors.push('Quantity cannot be negative');
  }

  if (minStock !== undefined && (typeof minStock !== 'number' || minStock < 0)) {
    errors.push('Minimum stock level cannot be negative');
  }

  if (maxStock !== undefined && minStock !== undefined && maxStock < minStock) {
    errors.push('Maximum stock level must be greater than or equal to minimum stock level');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Stock Movement Input
 */
const validateStockMovementInput = (req, res, next) => {
  const { productId, type, quantity } = req.body;
  const errors = [];

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    errors.push('Valid Product ID is required');
  }

  if (!type || !['IN', 'OUT', 'RETURN', 'ADJUSTMENT'].includes(type)) {
    errors.push('Movement type must be one of: IN, OUT, RETURN, ADJUSTMENT');
  }

  if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
    errors.push('Quantity must be a positive number greater than 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateProductInput,
  validateStockMovementInput,
};
