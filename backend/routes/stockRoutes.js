const express = require('express');
const router = express.Router();
const {
  getStockMovements,
  recordStockMovement,
  getProductMovements
} = require('../controllers/stockController');
const { validateObjectId, validateStockMovementInput } = require('../middleware/validation');

router.route('/')
  .get(getStockMovements)
  .post(validateStockMovementInput, recordStockMovement);

router.get('/product/:productId', validateObjectId('productId'), getProductMovements);

module.exports = router;
