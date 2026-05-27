const mongoose = require('mongoose');

/**
 * Records inventory transactions for products (in, out, adjustment)
 */
const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    autopopulate: true,
  },
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  prevQuantity: {
    type: Number,
    default: 0,
  },
  newQuantity: {
    type: Number,
    default: 0,
  },
  // optional link to related document (invoice, purchase, etc.)
  referenceModel: {
    type: String,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  reason: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

stockMovementSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('StockMovement', stockMovementSchema);
