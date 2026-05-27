const mongoose = require('mongoose');

/**
 * Create a compensating stock movement linked to an original movement.
 * Body: { movementId, type: 'in'|'out'|'adjustment', quantity, reason, referenceModel, referenceId, allowNegative }
 * Only owner or inventory_manager may perform corrections.
 */
const correct = async (req, res) => {
  try {
    const { movementId, type, quantity, reason, referenceModel, referenceId, allowNegative } = req.body || {};

    if (!movementId || !mongoose.Types.ObjectId.isValid(movementId)) {
      return res.status(400).json({ success: false, result: null, message: 'Invalid or missing movementId' });
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return res.status(400).json({ success: false, result: null, message: "Invalid type. Allowed: 'in','out','adjustment'" });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, result: null, message: 'Quantity must be a non-negative number' });
    }

    // Role check
    if (!req.admin || !req.admin.role || !['owner', 'admin', 'inventory_manager'].includes(req.admin.role)) {
      return res.status(403).json({ success: false, result: null, message: 'Insufficient role to perform correction' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const StockMovement = mongoose.model('StockMovement');
      const Product = mongoose.model('Product');

      const original = await StockMovement.findById(movementId).session(session).exec();
      if (!original) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, result: null, message: 'Original movement not found' });
      }

      const product = await Product.findById(original.product).session(session).exec();
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, result: null, message: 'Product not found' });
      }

      let newQty = product.quantity || 0;
      if (type === 'in') newQty = newQty + qty;
      else if (type === 'out') newQty = newQty - qty;
      else if (type === 'adjustment') newQty = qty;

      const allowNeg = !!allowNegative;
      if (!allowNeg && newQty < 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, result: null, message: 'Insufficient stock: resulting quantity would be negative' });
      }

      const prevQty = product.quantity || 0;
      product.quantity = newQty;
      await product.save({ session });

      const correction = await new StockMovement({
        product: product._id,
        type,
        quantity: qty,
        prevQuantity: prevQty,
        newQuantity: newQty,
        reason: reason || `Correction for movement ${movementId}`,
        referenceModel: referenceModel || 'StockMovement',
        referenceId: referenceId || movementId,
        createdBy: req.admin && req.admin._id ? req.admin._id : null,
      }).save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ success: true, result: { original, correction, product }, message: 'Correction recorded and product updated' });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    console.error('StockMovement correction error:', error);
    return res.status(500).json({ success: false, result: null, message: error.message || 'Failed to perform correction' });
  }
};

module.exports = correct;
