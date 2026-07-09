const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const schema = require('./schemaValidate');

const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, result: null, message: 'Invalid or missing id' });
    }

    const body = req.body || {};
    const { error, value } = schema.validate(body);
    if (error) {
      const { details } = error;
      return res.status(400).json({ success: false, result: null, message: details[0]?.message });
    }

    // Role check: only owner, admin or inventory_manager can update terms (same as StockMovement)
    const allowedRoles = ['owner', 'admin', 'inventory_manager'];
    if (!req.admin || !req.admin.role || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, result: null, message: 'Insufficient role to update terms and conditions' });
    }

    // Fetch the current term being updated
    const currentTerm = await Model.findOne({ _id: id, removed: false });
    if (currentTerm) {
      // Force isDefault to false if the term is disabled
      if (value.enabled === false) {
        value.isDefault = false;
      }

      // If the default status is lost (either disabled or explicitly unset),
      // we promote the next in line active enabled term to default.
      const lostDefaultStatus =
        (currentTerm.isDefault && value.isDefault === false) ||
        (currentTerm.isDefault && value.enabled === false);

      if (lostDefaultStatus) {
        const nextDefault = await Model.findOne({
      _id: { $ne: id },
      removed: false,
      enabled: true,
      ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {})
    }).sort({ created: -1 });
        if (nextDefault) {
          await Model.updateOne({ _id: nextDefault._id }, { isDefault: true });
        }
      }
    }

    // If this is set as default, unset other default terms
    if (value.isDefault) {
      await Model.updateMany(
        { removed: false, isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    const updated = await Model.findOneAndUpdate({ _id: id }, { $set: value }, { new: true }).populate('createdBy').exec();
    if (!updated) {
      return res.status(404).json({ success: false, result: null, message: 'Terms and conditions not found' });
    }

    return res.status(200).json({ success: true, result: updated, message: 'Terms and conditions updated successfully' });
  } catch (error) {
    console.error('Terms and conditions update error:', error);
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = update;
