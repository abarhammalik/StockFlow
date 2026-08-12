const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  costPrice: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'MOBILE_BANKING', 'OTHER'],
      default: 'CASH',
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'PARTIAL'],
      default: 'PAID',
    },
    saleStatus: {
      type: String,
      enum: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
      default: 'COMPLETED',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('Sale', saleSchema);
