const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    type: {
      type: String,
      required: [true, 'Movement type is required'],
      enum: ['IN', 'OUT', 'RETURN', 'ADJUSTMENT'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    previousStock: {
      type: Number,
      required: [true, 'Previous stock level is required'],
      min: [0, 'Previous stock cannot be negative'],
    },
    newStock: {
      type: Number,
      required: [true, 'New stock level is required'],
      min: [0, 'New stock level cannot be negative'],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Movements are immutable ledger entries
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Database Indexes for Fast Movement Querying and Time-Series Analytics
stockMovementSchema.index({ productId: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
