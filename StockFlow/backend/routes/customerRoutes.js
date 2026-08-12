const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
} = require('../controllers/customerController');
const { validateObjectId } = require('../middleware/validation');

router.get('/', getCustomers);
router.get('/phone/:phone', getCustomerByPhone);
router.post('/', createCustomer);
router.put('/:id', validateObjectId('id'), updateCustomer);

module.exports = router;
