const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { validateObjectId } = require('../middleware/validation');

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .get(validateObjectId('id'), getCategoryById)
  .put(validateObjectId('id'), updateCategory)
  .delete(validateObjectId('id'), deleteCategory);

module.exports = router;
