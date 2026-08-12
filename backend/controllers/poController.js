const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const AuditLog = require('../models/AuditLog');

const generatePONumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;
  const lastPO = await PurchaseOrder.findOne({ poNumber: { $regex: `^${prefix}` } }).sort({ createdAt: -1 });
  let nextSeq = 1;
  if (lastPO && lastPO.poNumber) {
    const parts = lastPO.poNumber.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }
  }
  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
};

const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      PurchaseOrder.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: orders.length,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1, limit: limitNum },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplierId, supplierName, items, notes, expectedDeliveryDate } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'PO items cannot be empty' });
    }

    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const qty = parseInt(item.quantity, 10) || 1;
      const cost = parseFloat(item.costPrice) || product.costPrice || 0;
      const subtotal = qty * cost;
      calculatedTotal += subtotal;

      processedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        costPrice: cost,
        quantity: qty,
        subtotal,
      });
    }

    const poNumber = await generatePONumber();

    const po = await PurchaseOrder.create({
      poNumber,
      supplierId,
      supplierName,
      items: processedItems,
      totalAmount: calculatedTotal,
      status: 'ORDERED',
      notes,
      expectedDeliveryDate,
    });

    await AuditLog.create({
      action: 'PO_CREATED',
      module: 'PURCHASE_ORDERS',
      description: `Created Purchase Order #${poNumber} for ${supplierName} ($${calculatedTotal.toFixed(2)})`,
      metadata: { poId: po._id, poNumber },
    });

    res.status(201).json({ success: true, message: 'Purchase Order created', data: po });
  } catch (error) {
    next(error);
  }
};

const updatePOStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

    const prevStatus = po.status;
    po.status = status;

    // If status is changed to RECEIVED, auto-restock MongoDB product stock!
    if (status === 'RECEIVED' && prevStatus !== 'RECEIVED') {
      po.receivedAt = new Date();
      for (const item of po.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const previousStock = product.quantity;
          product.quantity += item.quantity;
          await product.save();

          await StockMovement.create({
            productId: product._id,
            type: 'IN',
            quantity: item.quantity,
            previousStock,
            newStock: product.quantity,
            reason: 'PURCHASE',
            reference: po.poNumber,
          });

          if (req.io) {
            req.io.emit('INVENTORY_UPDATED', {
              type: 'PO_RECEIVED',
              poNumber: po.poNumber,
              productId: product._id,
              newStock: product.quantity,
            });
          }
        }
      }
    }

    await po.save();

    await AuditLog.create({
      action: 'PO_STATUS_UPDATED',
      module: 'PURCHASE_ORDERS',
      description: `Updated PO #${po.poNumber} status to ${status}`,
      metadata: { poId: po._id, status },
    });

    res.json({ success: true, message: `PO status updated to ${status}`, data: po });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
};
