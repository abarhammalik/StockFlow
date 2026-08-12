const express = require('express');
const router = express.Router();
const {
  createSale,
  refundSale,
  globalSearch,
  getSales,
  getSaleById,
} = require('../controllers/saleController');
const { validateObjectId } = require('../middleware/validation');

router.get('/global-search', globalSearch);
router.get('/', getSales);
router.get('/:id', validateObjectId('id'), getSaleById);
router.post('/', createSale);
router.post('/:id/refund', validateObjectId('id'), refundSale);

module.exports = router;
