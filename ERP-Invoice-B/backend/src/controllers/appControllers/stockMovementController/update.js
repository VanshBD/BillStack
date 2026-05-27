const mongoose = require('mongoose');

/**
 * Update StockMovement: only allow editing non-stock fields (reason, referenceModel, referenceId)
 * Disallow changes to product, quantity, type, prevQuantity, newQuantity via this endpoint.
 */
const { updateSchema } = require('./schemaValidate');

const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, result: null, message: 'Invalid or missing id' });
    }

    const body = req.body || {};
    const { error, value } = updateSchema.validate(body);
    if (error) {
      const { details } = error;
      return res.status(400).json({ success: false, result: null, message: details[0]?.message });
    }

    // Prevent edits to stock-impacting fields
    const forbidden = ['product', 'quantity', 'type', 'prevQuantity', 'newQuantity'];
    for (const f of forbidden) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        return res.status(403).json({ success: false, result: null, message: `Editing field '${f}' is not allowed` });
      }
    }

    // Role check: only owner, admin or inventory_manager can update non-stock fields
    const allowedRoles = ['owner', 'admin', 'inventory_manager'];
    if (!req.admin || !req.admin.role || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, result: null, message: 'Insufficient role to update stock movement' });
    }

    const StockMovement = mongoose.model('StockMovement');
    const updated = await StockMovement.findOneAndUpdate({ _id: id }, { $set: value }, { new: true }).populate(['product', 'createdBy']).exec();
    if (!updated) {
      return res.status(404).json({ success: false, result: null, message: 'Stock movement not found' });
    }

    return res.status(200).json({ success: true, result: updated, message: 'Stock movement updated successfully' });
  } catch (error) {
    console.error('StockMovement update error:', error);
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = update;
