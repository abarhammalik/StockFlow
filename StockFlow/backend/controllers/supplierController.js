const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

/**
 * @desc    Get all suppliers with aggregated metrics ($lookup, $project, $sort)
 * @route   GET /api/suppliers
 */
const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'suppliedProducts'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          company: 1,
          email: 1,
          phone: 1,
          address: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          productCount: { $size: '$suppliedProducts' },
          totalQuantitySupplied: { $sum: '$suppliedProducts.quantity' },
          totalInventoryValue: {
            $sum: {
              $map: {
                input: '$suppliedProducts',
                as: 'p',
                in: { $multiply: ['$$p.quantity', '$$p.price'] }
              }
            }
          },
          lowStockCount: {
            $size: {
              $filter: {
                input: '$suppliedProducts',
                as: 'p',
                cond: { $lte: ['$$p.quantity', '$$p.minStock'] }
              }
            }
          }
        }
      },
      { $sort: { company: 1 } }
    ]);

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get supplier by ID with product portfolio details
 * @route   GET /api/suppliers/:id
 */
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const products = await Product.find({ supplierId: supplier._id })
      .populate('categoryId', 'name')
      .select('name sku price quantity minStock unit status');

    res.json({
      success: true,
      data: {
        ...supplier.toObject(),
        productCount: products.length,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new supplier
 * @route   POST /api/suppliers
 */
const createSupplier = async (req, res, next) => {
  try {
    const { name, company, email, phone, address, status } = req.body;

    const supplier = await Supplier.create({
      name,
      company,
      email,
      phone,
      address,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update supplier
 * @route   PUT /api/suppliers/:id
 */
const updateSupplier = async (req, res, next) => {
  try {
    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete supplier
 * @route   DELETE /api/suppliers/:id
 */
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const productsCount = await Product.countDocuments({ supplierId: supplier._id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier '${supplier.company}' because ${productsCount} product(s) are assigned to it.`
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
