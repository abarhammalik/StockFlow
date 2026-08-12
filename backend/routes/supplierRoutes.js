const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { validateObjectId } = require('../middleware/validation');

router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(validateObjectId('id'), getSupplierById)
  .put(validateObjectId('id'), updateSupplier)
  .delete(validateObjectId('id'), deleteSupplier);

module.exports = router;
