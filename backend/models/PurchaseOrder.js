const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  costPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    supplierName: { type: String, required: true },
    items: [poItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'],
      default: 'DRAFT',
    },
    notes: { type: String, trim: true },
    expectedDeliveryDate: { type: Date },
    receivedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

purchaseOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
