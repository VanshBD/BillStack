const mongoose = require('mongoose');

/**
 * Create a StockMovement and update Product.quantity in a MongoDB transaction.
 * Body params:
 * - product: product id (required)
 * - type: 'in' | 'out' | 'adjustment' (required)
 * - quantity: number (required). For 'adjustment', this is the absolute new quantity.
 * - referenceModel, referenceId, reason (optional)
 * - allowNegative: boolean (optional) - defaults to false; when true, allows resulting stock < 0
 */
const create = async (req, res) => {
  const { createSchema } = require('./schemaValidate');
  const body = req.body || {};

  const { error, value } = createSchema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({ success: false, result: null, message: details[0]?.message });
  }

  const { product: productId, type, quantity, referenceModel, referenceId, reason, allowNegative } = value;
  const qty = Number(quantity);

  // Restrict adjustments to owner and inventory_manager roles
  if (type === 'adjustment') {
    if (!req.admin || !req.admin.role || !['owner', 'admin', 'inventory_manager'].includes(req.admin.role)) {
      return res.status(403).json({ success: false, result: null, message: 'Only owner or inventory_manager roles can create adjustment stock movements' });
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Product = mongoose.model('Product');
    const StockMovement = mongoose.model('StockMovement');

    const product = await Product.findById(productId).session(session).exec();
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, result: null, message: 'Product not found' });
    }

    let newQty = product.quantity || 0;

    if (type === 'in') {
      newQty = newQty + qty;
    } else if (type === 'out') {
      newQty = newQty - qty;
    } else if (type === 'adjustment') {
      // treat provided quantity as absolute new stock level
      newQty = qty;
    }

    const allowNeg = !!allowNegative;
    if (!allowNeg && newQty < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, result: null, message: 'Insufficient stock: resulting quantity would be negative' });
    }

    // Update product quantity
    const prevQty = product.quantity || 0;
    product.quantity = newQty;
    await product.save({ session });

    // Create stock movement record with prev/new quantities
    const movement = await new StockMovement({
      product: product._id,
      type,
      quantity: qty,
      prevQuantity: prevQty,
      newQuantity: newQty,
      referenceModel: referenceModel || '',
      referenceId: referenceId || null,
      reason: reason || '',
      createdBy: req.admin && req.admin._id ? req.admin._id : null,
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, result: { movement, product }, message: 'Stock movement recorded and product quantity updated' });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (e) {
      // ignore
    }
    session.endSession();
    console.error('StockMovement create error:', error);
    return res.status(500).json({ success: false, result: null, message: error.message || 'Failed to create stock movement' });
  }
};

module.exports = create;
