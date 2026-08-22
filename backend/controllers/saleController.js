const { supabase } = require('../config/supabase');
const { formatSale, formatRecord } = require('../utils/supabaseHelpers');

/**
 * Helper to generate next sequential invoice number (Owner Scoped)
 * Format: INV-YYYY-XXXXX
 */
const generateInvoiceNumber = async (ownerId) => {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const { data: lastSales } = await supabase
    .from('sales')
    .select('invoice_number')
    .eq('owner_id', ownerId)
    .ilike('invoice_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextSequence = 1;
  if (lastSales && lastSales.length > 0 && lastSales[0].invoice_number) {
    const parts = lastSales[0].invoice_number.split('-');
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
 * @desc    Process customer purchase / POS Billing & atomic stock deduction (Owner Scoped)
 * @route   POST /api/sales
 * @access  Private
 */
const createSale = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      discountRate = 0,
      taxRate = 0,
      paymentMethod = 'CASH',
      notes = '',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
    }

    // STEP 1: Fetch product details & validate stock
    const processedItems = [];
    let calculatedSubtotal = 0;
    const stockUpdates = [];

    for (const item of items) {
      const pId = item.productId || item._id || item.id;
      const requestedQty = parseInt(item.quantity, 10);

      if (!pId || !requestedQty || requestedQty <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product item or quantity in cart' });
      }

      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', pId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (prodErr || !product) {
        return res.status(404).json({ success: false, message: `Product not found or access denied (ID: ${pId})` });
      }

      if (product.quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'! Available: ${product.quantity} ${product.unit}, Requested: ${requestedQty}`,
        });
      }

      const itemPrice = parseFloat(product.price);
      const itemSubtotal = itemPrice * requestedQty;
      calculatedSubtotal += itemSubtotal;

      processedItems.push({
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        cost_price: parseFloat(product.cost_price) || 0,
        quantity: requestedQty,
        subtotal: itemSubtotal,
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

    // STEP 3: Handle Customer Profile
    const cleanPhone = customerPhone.trim();
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('owner_id', ownerId)
      .maybeSingle();

    let customerId = null;
    if (!existingCustomer) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          owner_id: ownerId,
          name: customerName.trim(),
          phone: cleanPhone,
          email: customerEmail ? customerEmail.trim() : null,
          total_orders: 1,
          total_spent: grandTotal,
        })
        .select('id')
        .single();
      if (newCustomer) customerId = newCustomer.id;
    } else {
      customerId = existingCustomer.id;
      await supabase
        .from('customers')
        .update({
          total_orders: (existingCustomer.total_orders || 0) + 1,
          total_spent: (parseFloat(existingCustomer.total_spent) || 0) + grandTotal,
          name: customerName.trim() || existingCustomer.name,
          email: customerEmail ? customerEmail.trim() : existingCustomer.email,
        })
        .eq('id', existingCustomer.id);
    }

    // STEP 4: Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber(ownerId);

    // STEP 5: Create Sale Document in Supabase
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({
        owner_id: ownerId,
        invoice_number: invoiceNumber,
        customer_id: customerId,
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_email: customerEmail ? customerEmail.trim() : null,
        subtotal: calculatedSubtotal,
        discount_rate: parsedDiscountRate,
        discount_amount: discountAmount,
        tax_rate: parsedTaxRate,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        payment_status: 'PAID',
        sale_status: 'COMPLETED',
        notes: notes || '',
      })
      .select('*')
      .single();

    if (saleErr) throw saleErr;

    // STEP 6: Insert Sale Items
    const itemsToInsert = processedItems.map((item) => ({
      sale_id: sale.id,
      ...item,
    }));
    const { error: itemsErr } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    // STEP 7: Execute Stock Deductions & Log Movements
    const updatedProductsPayload = [];
    for (const update of stockUpdates) {
      await supabase
        .from('products')
        .update({ quantity: update.newStock })
        .eq('id', update.product.id)
        .eq('owner_id', ownerId);

      await supabase.from('stock_movements').insert({
        owner_id: ownerId,
        product_id: update.product.id,
        type: 'OUT',
        quantity: update.requestedQty,
        previous_stock: update.previousStock,
        new_stock: update.newStock,
        reason: 'SALE',
        reference: invoiceNumber,
      });

      updatedProductsPayload.push({
        productId: update.product.id,
        sku: update.product.sku,
        name: update.product.name,
        newStock: update.newStock,
        minStock: update.product.min_stock,
        isLowStock: update.newStock <= update.product.min_stock,
        quantityChanged: -update.requestedQty,
      });
    }

    // Record Audit Log
    await supabase.from('audit_logs').insert({
      owner_id: ownerId,
      action: 'SALE_COMPLETED',
      module: 'SALES',
      description: `Completed Sale #${invoiceNumber} for ${customerName} ($${grandTotal.toFixed(2)})`,
      metadata: { saleId: sale.id, invoiceNumber, grandTotal },
    });

    // STEP 8: Real-Time WebSocket Event Emission
    if (req.io) {
      req.io.emit('INVENTORY_UPDATED', {
        type: 'SALE_COMPLETED',
        invoiceNumber,
        updatedProducts: updatedProductsPayload,
        timestamp: new Date(),
      });

      req.io.emit('SALE_CREATED', {
        saleId: sale.id,
        invoiceNumber: sale.invoice_number,
        grandTotal: sale.grand_total,
        customerName: sale.customer_name,
        timestamp: sale.created_at,
      });
    }

    const { data: fullSale } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', sale.id)
      .single();

    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully',
      data: formatSale(fullSale),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process sale return / refund & restore stock (Owner Scoped)
 * @route   POST /api/sales/:id/refund
 * @access  Private
 */
const refundSale = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (saleErr || !sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found or access denied' });
    }

    if (sale.sale_status === 'REFUNDED') {
      return res.status(400).json({ success: false, message: 'This sale has already been refunded' });
    }

    await supabase
      .from('sales')
      .update({ sale_status: 'REFUNDED', payment_status: 'PARTIAL' })
      .eq('id', sale.id);

    const items = sale.sale_items || [];
    for (const item of items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('id, quantity')
          .eq('id', item.product_id)
          .eq('owner_id', ownerId)
          .maybeSingle();

        if (product) {
          const previousStock = product.quantity;
          const newStock = previousStock + item.quantity;
          await supabase.from('products').update({ quantity: newStock }).eq('id', product.id);

          await supabase.from('stock_movements').insert({
            owner_id: ownerId,
            product_id: product.id,
            type: 'RETURN',
            quantity: item.quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reason: 'RETURN',
            reference: `REFUND-${sale.invoice_number}`,
          });
        }
      }
    }

    await supabase.from('audit_logs').insert({
      owner_id: ownerId,
      action: 'SALE_REFUNDED',
      module: 'SALES',
      description: `Refunded Sale #${sale.invoice_number} and restored product stock`,
      metadata: { saleId: sale.id, invoiceNumber: sale.invoice_number },
    });

    if (req.io) {
      req.io.emit('INVENTORY_UPDATED', {
        type: 'SALE_REFUNDED',
        invoiceNumber: sale.invoice_number,
        timestamp: new Date(),
      });
    }

    const { data: updatedSale } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', sale.id)
      .single();

    res.json({
      success: true,
      message: `Sale #${sale.invoice_number} has been refunded and stock restored!`,
      data: formatSale(updatedSale),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Global cross-collection search (Owner Scoped)
 * @route   GET /api/sales/global-search
 * @access  Private
 */
const globalSearch = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { products: [], sales: [], customers: [] } });
    }

    const clean = q.trim().replace(/[%,]/g, '');

    const [productsRes, salesRes, customersRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, sku, price, quantity, unit')
        .eq('owner_id', ownerId)
        .or(`name.ilike.%${clean}%,sku.ilike.%${clean}%`)
        .limit(5),
      supabase
        .from('sales')
        .select('id, invoice_number, customer_name, grand_total, created_at')
        .eq('owner_id', ownerId)
        .or(`invoice_number.ilike.%${clean}%,customer_name.ilike.%${clean}%,customer_phone.ilike.%${clean}%`)
        .limit(5),
      supabase
        .from('customers')
        .select('id, name, phone, total_spent')
        .eq('owner_id', ownerId)
        .or(`name.ilike.%${clean}%,phone.ilike.%${clean}%,email.ilike.%${clean}%`)
        .limit(5),
    ]);

    const products = (productsRes.data || []).map(formatRecord);
    const sales = (salesRes.data || []).map(formatRecord);
    const customers = (customersRes.data || []).map(formatRecord);

    res.json({
      success: true,
      data: { products, sales, customers },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sales transactions (Owner Scoped)
 * @route   GET /api/sales
 * @access  Private
 */
const getSales = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { search, paymentMethod, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let query = supabase
      .from('sales')
      .select('*, sale_items(*)', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (search) {
      const clean = search.trim().replace(/[%,]/g, '');
      query = query.or(`invoice_number.ilike.%${clean}%,customer_name.ilike.%${clean}%,customer_phone.ilike.%${clean}%`);
    }

    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + limitNum - 1);

    const { data: sales, count, error } = await query;
    if (error) throw error;

    const total = count !== null ? count : (sales || []).length;
    const data = (sales || []).map(formatSale);

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
 * @desc    Get single sale by ID (Owner Scoped)
 * @route   GET /api/sales/:id
 * @access  Private
 */
const getSaleById = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: sale, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('id', req.params.id)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found or access denied' });
    }

    res.json({
      success: true,
      data: formatSale(sale),
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
