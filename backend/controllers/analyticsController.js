const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');
const Sale = require('../models/Sale');

/**
 * @desc    Get Dashboard Summary Metrics using MongoDB $facet pipeline
 * @route   GET /api/analytics/dashboard
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [summaryFacet, todaySalesFacet] = await Promise.all([
      Product.aggregate([
        {
          $facet: {
            productMetrics: [
              {
                $group: {
                  _id: null,
                  totalProducts: { $sum: 1 },
                  totalQuantity: { $sum: '$quantity' },
                  totalInventoryValue: { $sum: { $multiply: ['$quantity', '$price'] } },
                  totalCostValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
                  lowStockCount: {
                    $sum: {
                      $cond: [
                        { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minStock'] }] },
                        1,
                        0
                      ]
                    }
                  },
                  outOfStockCount: {
                    $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
                  },
                  healthyStockCount: {
                    $sum: {
                      $cond: [
                        { $and: [{ $gt: ['$quantity', '$minStock'] }, { $lt: ['$quantity', '$maxStock'] }] },
                        1,
                        0
                      ]
                    }
                  },
                  overstockedCount: {
                    $sum: { $cond: [{ $gte: ['$quantity', '$maxStock'] }, 1, 0] }
                  }
                }
              }
            ],
            lowStockProducts: [
              {
                $match: {
                  $expr: { $lte: ['$quantity', '$minStock'] }
                }
              },
              { $sort: { quantity: 1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'categories',
                  localField: 'categoryId',
                  foreignField: '_id',
                  as: 'category'
                }
              },
              { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  sku: 1,
                  quantity: 1,
                  minStock: 1,
                  price: 1,
                  unit: 1,
                  categoryName: '$category.name'
                }
              }
            ]
          }
        }
      ]),
      Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday },
            saleStatus: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: null,
            todayRevenue: { $sum: '$grandTotal' },
            todayOrdersCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalCategories = await Category.countDocuments({ status: 'active' });
    const totalSuppliers = await Supplier.countDocuments({ status: 'active' });

    const [recentMovements, recentSales] = await Promise.all([
      StockMovement.find()
        .populate({
          path: 'productId',
          select: 'name sku unit price'
        })
        .sort({ createdAt: -1 })
        .limit(6),
      Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber customerName grandTotal paymentMethod createdAt saleStatus')
    ]);

    const metrics = summaryFacet[0]?.productMetrics[0] || {
      totalProducts: 0,
      totalQuantity: 0,
      totalInventoryValue: 0,
      totalCostValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      healthyStockCount: 0,
      overstockedCount: 0
    };

    const todaySales = todaySalesFacet[0] || { todayRevenue: 0, todayOrdersCount: 0 };

    res.json({
      success: true,
      data: {
        summary: {
          ...metrics,
          potentialProfit: (metrics.totalInventoryValue - metrics.totalCostValue) || 0,
          todayRevenue: todaySales.todayRevenue || 0,
          todayOrdersCount: todaySales.todayOrdersCount || 0,
          totalCategories,
          totalSuppliers
        },
        lowStockAlerts: summaryFacet[0]?.lowStockProducts || [],
        recentMovements,
        recentSales
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Inventory Value & Stats by Category ($lookup, $unwind, $group, $project, $sort)
 * @route   GET /api/analytics/categories
 */
const getCategoryAnalytics = async (req, res, next) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          categoryDescription: { $first: '$category.description' },
          productCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalInventoryValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          totalCostValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          categoryName: 1,
          categoryDescription: 1,
          productCount: 1,
          totalQuantity: 1,
          totalInventoryValue: { $round: ['$totalInventoryValue', 2] },
          totalCostValue: { $round: ['$totalCostValue', 2] },
          profitMargin: {
            $round: [
              {
                $cond: [
                  { $gt: ['$totalInventoryValue', 0] },
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ['$totalInventoryValue', '$totalCostValue'] },
                          '$totalInventoryValue'
                        ]
                      },
                      100
                    ]
                  },
                  0
                ]
              },
              1
            ]
          },
          lowStockCount: 1
        }
      },
      { $sort: { totalInventoryValue: -1 } }
    ]);

    res.json({
      success: true,
      count: categoryStats.length,
      data: categoryStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supplier Portfolio & Value Analysis ($lookup, $unwind, $group, $project, $sort)
 * @route   GET /api/analytics/suppliers
 */
const getSupplierAnalytics = async (req, res, next) => {
  try {
    const supplierStats = await Product.aggregate([
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $group: {
          _id: '$supplier._id',
          contactName: { $first: '$supplier.name' },
          companyName: { $first: '$supplier.company' },
          email: { $first: '$supplier.email' },
          phone: { $first: '$supplier.phone' },
          productCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalInventoryValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          contactName: 1,
          companyName: 1,
          email: 1,
          phone: 1,
          productCount: 1,
          totalQuantity: 1,
          totalInventoryValue: { $round: ['$totalInventoryValue', 2] },
          lowStockCount: 1
        }
      },
      { $sort: { totalInventoryValue: -1 } }
    ]);

    res.json({
      success: true,
      count: supplierStats.length,
      data: supplierStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Top Moving Products Ranking ($group, $sort, $limit, $lookup, $unwind)
 * @route   GET /api/analytics/top-products
 */
const getTopMovingProducts = async (req, res, next) => {
  try {
    const topProducts = await StockMovement.aggregate([
      {
        $group: {
          _id: '$productId',
          totalMovedQuantity: { $sum: '$quantity' },
          movementCount: { $sum: 1 },
          outQuantity: {
            $sum: { $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0] }
          },
          inQuantity: {
            $sum: { $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0] }
          }
        }
      },
      { $sort: { totalMovedQuantity: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'productId', // wait, product._id
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          sku: '$product.sku',
          price: '$product.price',
          currentStock: '$product.quantity',
          unit: '$product.unit',
          categoryName: '$category.name',
          totalMovedQuantity: 1,
          movementCount: 1,
          outQuantity: 1,
          inQuantity: 1
        }
      }
    ]);

    res.json({
      success: true,
      count: topProducts.length,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Low-Stock Products evaluated via MongoDB $expr ($match, $lookup, $sort)
 * @route   GET /api/analytics/low-stock
 */
const getLowStockAnalytics = async (req, res, next) => {
  try {
    const lowStockProducts = await Product.aggregate([
      {
        $match: {
          $expr: { $lte: ['$quantity', '$minStock'] }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          price: 1,
          quantity: 1,
          minStock: 1,
          unit: 1,
          categoryName: '$category.name',
          supplierCompany: '$supplier.company',
          isOutOfStock: { $eq: ['$quantity', 0] }
        }
      },
      { $sort: { quantity: 1 } }
    ]);

    res.json({
      success: true,
      count: lowStockProducts.length,
      data: lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Time Series Stock Movement Analytics ($match, $group, $sort)
 * @route   GET /api/analytics/movements
 */
const getMovementAnalytics = async (req, res, next) => {
  try {
    const movementTrends = await StockMovement.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: movementTrends
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Comprehensive Sales & Profit Analytics ($group, $project, $facet)
 * @route   GET /api/analytics/sales
 */
const getSalesAnalytics = async (req, res, next) => {
  try {
    const salesFacet = await Sale.aggregate([
      {
        $facet: {
          overallMetrics: [
            { $match: { saleStatus: 'COMPLETED' } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$grandTotal' },
                totalSalesCount: { $sum: 1 },
                totalDiscountsGiven: { $sum: '$discountAmount' },
                totalTaxCollected: { $sum: '$taxAmount' }
              }
            }
          ],
          dailyRevenueTrends: [
            { $match: { saleStatus: 'COMPLETED' } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                dailyRevenue: { $sum: '$grandTotal' },
                orderCount: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } },
            { $limit: 30 }
          ],
          paymentMethodBreakdown: [
            { $match: { saleStatus: 'COMPLETED' } },
            {
              $group: {
                _id: '$paymentMethod',
                totalAmount: { $sum: '$grandTotal' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const metrics = salesFacet[0]?.overallMetrics[0] || {
      totalRevenue: 0,
      totalSalesCount: 0,
      totalDiscountsGiven: 0,
      totalTaxCollected: 0
    };

    res.json({
      success: true,
      data: {
        summary: metrics,
        dailyRevenueTrends: salesFacet[0]?.dailyRevenueTrends || [],
        paymentMethodBreakdown: salesFacet[0]?.paymentMethodBreakdown || []
      }
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
  getSalesAnalytics
};
