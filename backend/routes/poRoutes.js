const express = require('express');
const router = express.Router();
const { getPurchaseOrders, createPurchaseOrder, updatePOStatus } = require('../controllers/poController');
const { validateObjectId } = require('../middleware/validation');

router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id/status', validateObjectId('id'), updatePOStatus);

module.exports = router;
