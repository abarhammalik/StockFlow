const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getCategoryAnalytics,
  getSupplierAnalytics,
  getTopMovingProducts,
  getLowStockAnalytics,
  getMovementAnalytics,
  getSalesAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/categories', getCategoryAnalytics);
router.get('/suppliers', getSupplierAnalytics);
router.get('/top-products', getTopMovingProducts);
router.get('/low-stock', getLowStockAnalytics);
router.get('/movements', getMovementAnalytics);
router.get('/sales', getSalesAnalytics);

module.exports = router;
