const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

const generatePONumber = async (ownerId) => {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;

  const { data: lastPOs } = await supabase
    .from('purchase_orders')
    .select('po_number')
    .eq('owner_id', ownerId)
    .ilike('po_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextSeq = 1;
  if (lastPOs && lastPOs.length > 0 && lastPOs[0].po_number) {
    const parts = lastPOs[0].po_number.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }
  }
  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
};

/**
 * @desc    Get purchase orders (Owner Scoped)
 * @route   GET /api/purchase-orders
 * @access  Private
 */
const getPurchaseOrders = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let query = supabase
      .from('purchase_orders')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (status) query = query.eq('status', status);

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + limitNum - 1);

    const { data: orders, count, error } = await query;
    if (error) throw error;

    const total = count !== null ? count : (orders || []).length;
    const data = (orders || []).map(formatRecord);

    res.json({
      success: true,
      count: data.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create purchase order (Owner Scoped)
 * @route   POST /api/purchase-orders
 * @access  Private
 */
const createPurchaseOrder = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { supplierId, supplierName, items, notes = '', expectedDeliveryDate } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'PO items cannot be empty' });
    }

    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const pId = item.productId || item._id || item.id;
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', pId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (!product) continue;
      const qty = parseInt(item.quantity, 10) || 1;
      const cost = parseFloat(item.costPrice) || parseFloat(product.cost_price) || 0;
      const subtotal = qty * cost;
      calculatedTotal += subtotal;

      processedItems.push({
        productId: product.id,
        _id: product.id,
        name: product.name,
        sku: product.sku,
        costPrice: cost,
        quantity: qty,
        subtotal,
      });
    }

    const poNumber = await generatePONumber(ownerId);

    const { data: po, error: insertErr } = await supabase
      .from('purchase_orders')
      .insert({
        owner_id: ownerId,
        po_number: poNumber,
        supplier_id: supplierId || null,
        supplier_name: supplierName || 'General Supplier',
        items: processedItems,
        total_amount: calculatedTotal,
        status: 'ORDERED',
        notes,
        expected_delivery_date: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    await supabase.from('audit_logs').insert({
      owner_id: ownerId,
      action: 'PO_CREATED',
      module: 'PURCHASE_ORDERS',
      description: `Created Purchase Order #${poNumber} for ${supplierName || 'Supplier'} ($${calculatedTotal.toFixed(2)})`,
      metadata: { poId: po.id, poNumber },
    });

    res.status(201).json({
      success: true,
      message: 'Purchase Order created',
      data: formatRecord(po),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update PO status (Owner Scoped)
 * @route   PUT /api/purchase-orders/:id/status
 * @access  Private
 */
const updatePOStatus = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { status } = req.body;

    const { data: po, error: fetchErr } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (fetchErr || !po) return res.status(404).json({ success: false, message: 'PO not found or access denied' });

    const prevStatus = po.status;
    const updates = { status };

    if (status === 'RECEIVED' && prevStatus !== 'RECEIVED') {
      updates.received_at = new Date().toISOString();
      const items = Array.isArray(po.items) ? po.items : [];

      for (const item of items) {
        const pId = item.productId || item._id || item.id;
        if (pId) {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', pId)
            .eq('owner_id', ownerId)
            .maybeSingle();

          if (product) {
            const previousStock = product.quantity;
            const itemQty = parseInt(item.quantity, 10) || 0;
            const newStock = previousStock + itemQty;

            await supabase.from('products').update({ quantity: newStock }).eq('id', product.id);

            await supabase.from('stock_movements').insert({
              owner_id: ownerId,
              product_id: product.id,
              type: 'IN',
              quantity: itemQty,
              previous_stock: previousStock,
              new_stock: newStock,
              reason: 'PURCHASE',
              reference: po.po_number,
            });

            if (req.io) {
              req.io.emit('INVENTORY_UPDATED', {
                type: 'PO_RECEIVED',
                poNumber: po.po_number,
                productId: product.id,
                newStock,
              });
            }
          }
        }
      }
    }

    const { data: updatedPo, error: updateErr } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', po.id)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    await supabase.from('audit_logs').insert({
      owner_id: ownerId,
      action: 'PO_STATUS_UPDATED',
      module: 'PURCHASE_ORDERS',
      description: `Updated PO #${po.po_number} status to ${status}`,
      metadata: { poId: po.id, status },
    });

    res.json({
      success: true,
      message: `PO status updated to ${status}`,
      data: formatRecord(updatedPo),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
};
