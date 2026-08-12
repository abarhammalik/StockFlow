const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['PRODUCTS', 'CATEGORIES', 'SUPPLIERS', 'SALES', 'STOCK', 'CUSTOMERS', 'PURCHASE_ORDERS', 'SETTINGS'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String,
      default: 'System Admin',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
