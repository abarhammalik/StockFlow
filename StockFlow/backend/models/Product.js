const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price must be greater than or equal to 0'],
    },
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minStock: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock cannot be negative'],
      default: 5,
    },
    maxStock: {
      type: Number,
      min: [0, 'Maximum stock cannot be negative'],
      default: 100,
      validate: {
        validator: function (val) {
          return val >= this.minStock;
        },
        message: 'Maximum stock level must be greater than or equal to minimum stock level',
      },
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'discontinued'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for Calculated Inventory Value
productSchema.virtual('inventoryValue').get(function () {
  return (this.quantity * this.price) || 0;
});

// Virtual for Calculated Stock Status Badge
productSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= this.minStock) return 'low_stock';
  if (this.quantity >= this.maxStock && this.maxStock > 0) return 'overstocked';
  return 'healthy';
});

// Database Indexes for Fast Filtering, Sorting, and Searching
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ supplierId: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);
