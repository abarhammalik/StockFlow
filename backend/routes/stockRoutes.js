const express = require('express');
const router = express.Router();
const {
  getStockMovements,
  recordStockMovement,
  getProductMovements
} = require('../controllers/stockController');
const { validateObjectId, validateStockMovementInput } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getStockMovements)
  .post(validateStockMovementInput, recordStockMovement);

router.get('/product/:productId', validateObjectId('productId'), getProductMovements);

module.exports = router;
