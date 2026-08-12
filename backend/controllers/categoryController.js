const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @desc    Get all categories with aggregated product count and stock value
 * @route   GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    // MongoDB Aggregation Pipeline to include product metrics per category
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          productCount: { $size: '$products' },
          totalStockQuantity: { $sum: '$products.quantity' },
          totalInventoryValue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'p',
                in: { $multiply: ['$$p.quantity', '$$p.price'] }
              }
            }
          },
          lowStockCount: {
            $size: {
              $filter: {
                input: '$products',
                as: 'p',
                cond: { $lte: ['$$p.quantity', '$$p.minStock'] }
              }
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({ categoryId: category._id });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name,
      description,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const nameExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (nameExists) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.status = status || category.status;

    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products exist in this category
    const productsInCat = await Product.countDocuments({ categoryId: category._id });
    if (productsInCat > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category '${category.name}' because it contains ${productsInCat} product(s). Please reassign or delete products first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
