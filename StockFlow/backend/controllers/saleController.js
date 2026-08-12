const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

/**
 * Helper to generate next sequential invoice number
 * Format: INV-YYYY-XXXXX
 */
const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const lastSale = await Sale.findOne({ invoiceNumber: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 })
    .select('invoiceNumber');

  let nextSequence = 1;
  if (lastSale && lastSale.invoiceNumber) {
    const parts = lastSale.invoiceNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(5, '0');
  return `${prefix}${paddedSeq}`;
};

/**
 * @desc    Process customer purchase / POS Billing & atomic stock deduction
 * @route   POST /api/sales
 */
const createSale = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items, // [{ productId, quantity }]
      discountRate = 0,
      taxRate = 0,
      paymentMethod = 'CASH',
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
    }

    // STEP 1: Fetch authoritative product details from MongoDB & validate stock
    const processedItems = [];
    let calculatedSubtotal = 0;
    const stockUpdates = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product item or quantity in cart' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found (ID: ${item.productId})` });
      }

      const requestedQty = parseInt(item.quantity, 10);

      // Strict backend stock check
      if (product.quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'! Available: ${product.quantity} ${product.unit}, Requested: ${requestedQty}`,
        });
      }

      const itemPrice = product.price; // Authoritative price from DB
      const itemSubtotal = itemPrice * requestedQty;
      calculatedSubtotal += itemSubtotal;

      processedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        costPrice: product.costPrice || 0,
        quantity: requestedQty,
        subtotal: itemSubtotal,
        previousStock: product.quantity,
        unit: product.unit,
      });

      stockUpdates.push({
        product,
        requestedQty,
        previousStock: product.quantity,
        newStock: product.quantity - requestedQty,
      });
    }

    // STEP 2: Calculate financial breakdown
    const parsedDiscountRate = Math.max(0, Math.min(100, parseFloat(discountRate) || 0));
    const discountAmount = (calculatedSubtotal * parsedDiscountRate) / 100;
    const amountAfterDiscount = calculatedSubtotal - discountAmount;

    const parsedTaxRate = Math.max(0, parseFloat(taxRate) || 0);
    const taxAmount = (amountAfterDiscount * parsedTaxRate) / 100;

    const grandTotal = amountAfterDiscount + taxAmount;

    // STEP 3: Handle Customer Profile (find or create)
    let customer = await Customer.findOne({ phone: customerPhone.trim() });
    if (!customer) {
      customer = await Customer.create({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail ? customerEmail.trim() : undefined,
        totalOrders: 1,
        totalSpent: grandTotal,
      });
    } else {
      customer.totalOrders += 1;
      customer.totalSpent += grandTotal;
      if (customerName) customer.name = customerName.trim();
      if (customerEmail) customer.email = customerEmail.trim();
      await customer.save();
    }

    // STEP 4: Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber();

    // STEP 5: Create Sale Document
    const sale = await Sale.create({
      invoiceNumber,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      items: processedItems,
      subtotal: calculatedSubtotal,
      discountRate: parsedDiscountRate,
      discountAmount,
      taxRate: parsedTaxRate,
      taxAmount,
      grandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      saleStatus: 'COMPLETED',
      notes,
    });

    // STEP 6: Execute Atomic Stock Deductions & Log Stock Movements
    const updatedProductsPayload = [];

    for (const update of stockUpdates) {
      // Atomic stock update in MongoDB
      const updatedProduct = await Product.findByIdAndUpdate(
        update.product._id,
        { $inc: { quantity: -update.requestedQty } },
        { new: true }
      );

      // Record immutable StockMovement ledger entry
      await StockMovement.create({
        productId: update.product._id,
        type: 'OUT',
        quantity: update.requestedQty,
        previousStock: update.previousStock,
        newStock: updatedProduct.quantity,
        reason: 'SALE',
        reference: invoiceNumber,
      });

      updatedProductsPayload.push({
        productId: updatedProduct._id.toString(),
        sku: updatedProduct.sku,
        name: updatedProduct.name,
        newStock: updatedProduct.quantity,
        minStock: updatedProduct.minStock,
        isLowStock: updatedProduct.quantity <= updatedProduct.minStock,
        quantityChanged: -update.requestedQty,
      });
    }

    // Record Audit Log
    await AuditLog.create({
      action: 'SALE_COMPLETED',
      module: 'SALES',
      description: `Completed Sale #${invoiceNumber} for ${customer.name} ($${grandTotal.toFixed(2)})`,
      metadata: { saleId: sale._id, invoiceNumber, grandTotal },
    });

    // STEP 7: Real-Time WebSocket Event Emission
    if (req.io) {
      req.io.emit('INVENTORY_UPDATED', {
        type: 'SALE_COMPLETED',
        invoiceNumber,
        updatedProducts: updatedProductsPayload,
        timestamp: new Date(),
      });

      req.io.emit('SALE_CREATED', {
        saleId: sale._id,
        invoiceNumber: sale.invoiceNumber,
        grandTotal: sale.grandTotal,
        customerName: sale.customerName,
        timestamp: sale.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process sale return / refund & restore stock in MongoDB
 * @route   POST /api/sales/:id/refund
 */
const refundSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (sale.saleStatus === 'REFUNDED') {
      return res.status(400).json({ success: false, message: 'This sale has already been refunded' });
    }

    sale.saleStatus = 'REFUNDED';
    sale.paymentStatus = 'PARTIAL';
    await sale.save();

    // Restore stock back to MongoDB for each item in the sale
    for (const item of sale.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const previousStock = product.quantity;
        product.quantity += item.quantity;
        await product.save();

        await StockMovement.create({
          productId: product._id,
          type: 'RETURN',
          quantity: item.quantity,
          previousStock,
          newStock: product.quantity,
          reason: 'RETURN',
          reference: `REFUND-${sale.invoiceNumber}`,
        });
      }
    }

    await AuditLog.create({
      action: 'SALE_REFUNDED',
      module: 'SALES',
      description: `Refunded Sale #${sale.invoiceNumber} and restored product stock`,
      metadata: { saleId: sale._id, invoiceNumber: sale.invoiceNumber },
    });

    if (req.io) {
      req.io.emit('INVENTORY_UPDATED', {
        type: 'SALE_REFUNDED',
        invoiceNumber: sale.invoiceNumber,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: `Sale #${sale.invoiceNumber} has been refunded and stock restored to MongoDB!`,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Global cross-collection search (Products, Invoices, Customers)
 * @route   GET /api/sales/global-search
 */
const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { products: [], sales: [], customers: [] } });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [products, sales, customers] = await Promise.all([
      Product.find({ $or: [{ name: regex }, { sku: regex }] }).limit(5).select('name sku price quantity unit'),
      Sale.find({ $or: [{ invoiceNumber: regex }, { customerName: regex }, { customerPhone: regex }] }).limit(5).select('invoiceNumber customerName grandTotal createdAt'),
      Customer.find({ $or: [{ name: regex }, { phone: regex }, { email: regex }] }).limit(5).select('name phone totalSpent'),
    ]);

    res.json({
      success: true,
      data: { products, sales, customers },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sales transactions
 */
const getSales = async (req, res, next) => {
  try {
    const { search, paymentMethod, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [sales, total] = await Promise.all([
      Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Sale.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: sales.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  refundSale,
  globalSearch,
  getSales,
  getSaleById,
};
