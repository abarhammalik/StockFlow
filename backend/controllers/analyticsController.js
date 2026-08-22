const { supabase } = require('../config/supabase');
const { formatRecord, formatSale } = require('../utils/supabaseHelpers');

/**
 * @desc    Get Dashboard Summary Metrics (Owner Scoped)
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      productsRes,
      todaySalesRes,
      categoriesCountRes,
      suppliersCountRes,
      recentMovementsRes,
      recentSalesRes,
    ] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, sku, price, cost_price, quantity, min_stock, max_stock, unit, category_id, categories:category_id(id, name)')
        .eq('owner_id', ownerId),
      supabase
        .from('sales')
        .select('grand_total')
        .eq('owner_id', ownerId)
        .eq('sale_status', 'COMPLETED')
        .gte('created_at', startOfToday.toISOString()),
      supabase
        .from('categories')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('status', 'active'),
      supabase
        .from('suppliers')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('status', 'active'),
      supabase
        .from('stock_movements')
        .select('*, products:product_id(name, sku, unit, price)')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('sales')
        .select('id, invoice_number, customer_name, grand_total, payment_method, created_at, sale_status')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const products = productsRes.data || [];
    let totalQuantity = 0;
    let totalInventoryValue = 0;
    let totalCostValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;
    let overstockedCount = 0;
    const lowStockAlerts = [];

    for (const p of products) {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      const cost = Number(p.cost_price) || 0;
      const min = Number(p.min_stock) || 5;
      const max = Number(p.max_stock) || 100;

      totalQuantity += qty;
      totalInventoryValue += qty * price;
      totalCostValue += qty * cost;

      if (qty === 0) {
        outOfStockCount++;
      }
      if (qty <= min) {
        lowStockCount++;
        lowStockAlerts.push({
          _id: p.id,
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: qty,
          minStock: min,
          price,
          unit: p.unit,
          categoryName: p.categories?.name || 'Uncategorized',
        });
      } else if (max > 0 && qty >= max) {
        overstockedCount++;
      } else {
        healthyStockCount++;
      }
    }

    lowStockAlerts.sort((a, b) => a.quantity - b.quantity);

    const todaySales = todaySalesRes.data || [];
    let todayRevenue = 0;
    for (const s of todaySales) {
      todayRevenue += Number(s.grand_total) || 0;
    }

    const recentMovements = (recentMovementsRes.data || []).map((m) => {
      const formatted = formatRecord(m);
      if (formatted.products) formatted.productId = formatRecord(formatted.products);
      return formatted;
    });

    const recentSales = (recentSalesRes.data || []).map(formatSale);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalQuantity,
          totalInventoryValue,
          totalCostValue,
          potentialProfit: totalInventoryValue - totalCostValue,
          lowStockCount,
          outOfStockCount,
          healthyStockCount,
          overstockedCount,
          todayRevenue,
          todayOrdersCount: todaySales.length,
          totalCategories: categoriesCountRes.count || 0,
          totalSuppliers: suppliersCountRes.count || 0,
        },
        lowStockAlerts: lowStockAlerts.slice(0, 5),
        recentMovements,
        recentSales,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Inventory Value & Stats by Category (Owner Scoped)
 * @route   GET /api/analytics/categories
 * @access  Private
 */
const getCategoryAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, products(id, quantity, price, cost_price, min_stock)')
      .eq('owner_id', ownerId);

    if (error) throw error;

    const categoryStats = (categories || []).map((cat) => {
      const prods = cat.products || [];
      let totalQuantity = 0;
      let totalInventoryValue = 0;
      let totalCostValue = 0;
      let lowStockCount = 0;

      for (const p of prods) {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const cost = Number(p.cost_price) || 0;
        const min = Number(p.min_stock) || 5;

        totalQuantity += qty;
        totalInventoryValue += qty * price;
        totalCostValue += qty * cost;
        if (qty <= min) lowStockCount++;
      }

      let profitMargin = 0;
      if (totalInventoryValue > 0) {
        profitMargin = Math.round(((totalInventoryValue - totalCostValue) / totalInventoryValue) * 1000) / 10;
      }

      return {
        _id: cat.id,
        id: cat.id,
        categoryName: cat.name,
        categoryDescription: cat.description,
        productCount: prods.length,
        totalQuantity,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        totalCostValue: Math.round(totalCostValue * 100) / 100,
        profitMargin,
        lowStockCount,
      };
    });

    categoryStats.sort((a, b) => b.totalInventoryValue - a.totalInventoryValue);

    res.json({
      success: true,
      count: categoryStats.length,
      data: categoryStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supplier Portfolio & Value Analysis (Owner Scoped)
 * @route   GET /api/analytics/suppliers
 * @access  Private
 */
const getSupplierAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('id, name, company, email, phone, products(id, quantity, price, min_stock)')
      .eq('owner_id', ownerId);

    if (error) throw error;

    const supplierStats = (suppliers || []).map((sup) => {
      const prods = sup.products || [];
      let totalQuantity = 0;
      let totalInventoryValue = 0;
      let lowStockCount = 0;

      for (const p of prods) {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const min = Number(p.min_stock) || 5;

        totalQuantity += qty;
        totalInventoryValue += qty * price;
        if (qty <= min) lowStockCount++;
      }

      return {
        _id: sup.id,
        id: sup.id,
        contactName: sup.name,
        companyName: sup.company,
        email: sup.email,
        phone: sup.phone,
        productCount: prods.length,
        totalQuantity,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        lowStockCount,
      };
    });

    supplierStats.sort((a, b) => b.totalInventoryValue - a.totalInventoryValue);

    res.json({
      success: true,
      count: supplierStats.length,
      data: supplierStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Top Moving Products Ranking (Owner Scoped)
 * @route   GET /api/analytics/top-products
 * @access  Private
 */
const getTopMovingProducts = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('product_id, quantity, type, products:product_id(id, name, sku, price, quantity, unit, categories:category_id(name))')
      .eq('owner_id', ownerId);

    if (error) throw error;

    const productMap = {};

    for (const m of movements || []) {
      if (!m.product_id || !m.products) continue;
      const pid = m.product_id;
      if (!productMap[pid]) {
        productMap[pid] = {
          _id: pid,
          id: pid,
          name: m.products.name,
          sku: m.products.sku,
          price: Number(m.products.price) || 0,
          currentStock: Number(m.products.quantity) || 0,
          unit: m.products.unit,
          categoryName: m.products.categories?.name || 'Uncategorized',
          totalMovedQuantity: 0,
          movementCount: 0,
          outQuantity: 0,
          inQuantity: 0,
        };
      }

      const qty = Number(m.quantity) || 0;
      productMap[pid].totalMovedQuantity += qty;
      productMap[pid].movementCount += 1;
      if (m.type === 'OUT') productMap[pid].outQuantity += qty;
      if (m.type === 'IN') productMap[pid].inQuantity += qty;
    }

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.totalMovedQuantity - a.totalMovedQuantity)
      .slice(0, 6);

    res.json({
      success: true,
      count: topProducts.length,
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Low-Stock Products (Owner Scoped)
 * @route   GET /api/analytics/low-stock
 * @access  Private
 */
const getLowStockAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, sku, price, quantity, min_stock, unit, categories:category_id(name), suppliers:supplier_id(company)')
      .eq('owner_id', ownerId);

    if (error) throw error;

    const lowStockProducts = (products || [])
      .filter((p) => Number(p.quantity) <= Number(p.min_stock))
      .map((p) => ({
        _id: p.id,
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price) || 0,
        quantity: Number(p.quantity) || 0,
        minStock: Number(p.min_stock) || 5,
        unit: p.unit,
        categoryName: p.categories?.name || 'Uncategorized',
        supplierCompany: p.suppliers?.company || 'General Supplier',
        isOutOfStock: Number(p.quantity) === 0,
      }))
      .sort((a, b) => a.quantity - b.quantity);

    res.json({
      success: true,
      count: lowStockProducts.length,
      data: lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Time Series Stock Movement Analytics (Owner Scoped)
 * @route   GET /api/analytics/movements
 * @access  Private
 */
const getMovementAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('created_at, type, quantity')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const trendMap = {};
    for (const m of movements || []) {
      const date = m.created_at ? m.created_at.split('T')[0] : 'Unknown';
      const key = `${date}_${m.type}`;
      if (!trendMap[key]) {
        trendMap[key] = {
          _id: { date, type: m.type },
          totalQuantity: 0,
          count: 0,
        };
      }
      trendMap[key].totalQuantity += Number(m.quantity) || 0;
      trendMap[key].count += 1;
    }

    const movementTrends = Object.values(trendMap);

    res.json({
      success: true,
      data: movementTrends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Comprehensive Sales & Profit Analytics (Owner Scoped)
 * @route   GET /api/analytics/sales
 * @access  Private
 */
const getSalesAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id;

    const { data: sales, error } = await supabase
      .from('sales')
      .select('grand_total, discount_amount, tax_amount, payment_method, created_at, sale_status')
      .eq('owner_id', ownerId)
      .eq('sale_status', 'COMPLETED')
      .order('created_at', { ascending: true });

    if (error) throw error;

    let totalRevenue = 0;
    let totalDiscountsGiven = 0;
    let totalTaxCollected = 0;
    const dailyMap = {};
    const paymentMap = {};

    for (const s of sales || []) {
      const total = Number(s.grand_total) || 0;
      const discount = Number(s.discount_amount) || 0;
      const tax = Number(s.tax_amount) || 0;

      totalRevenue += total;
      totalDiscountsGiven += discount;
      totalTaxCollected += tax;

      const date = s.created_at ? s.created_at.split('T')[0] : 'Unknown';
      if (!dailyMap[date]) {
        dailyMap[date] = { _id: date, dailyRevenue: 0, orderCount: 0 };
      }
      dailyMap[date].dailyRevenue += total;
      dailyMap[date].orderCount += 1;

      const method = s.payment_method || 'CASH';
      if (!paymentMap[method]) {
        paymentMap[method] = { _id: method, totalAmount: 0, count: 0 };
      }
      paymentMap[method].totalAmount += total;
      paymentMap[method].count += 1;
    }

    const dailyRevenueTrends = Object.values(dailyMap).slice(-30);
    const paymentMethodBreakdown = Object.values(paymentMap);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalSalesCount: (sales || []).length,
          totalDiscountsGiven,
          totalTaxCollected,
        },
        dailyRevenueTrends,
        paymentMethodBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getCategoryAnalytics,
  getSupplierAnalytics,
  getTopMovingProducts,
  getLowStockAnalytics,
  getMovementAnalytics,
  getSalesAnalytics,
};
