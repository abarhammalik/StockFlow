const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { validateObjectId, validateProductInput } = require('../middleware/validation');

router.route('/')
  .get(getProducts)
  .post(validateProductInput, createProduct);

router.route('/:id')
  .get(validateObjectId('id'), getProductById)
  .put(validateObjectId('id'), updateProduct)
  .delete(validateObjectId('id'), deleteProduct);

module.exports = router;
