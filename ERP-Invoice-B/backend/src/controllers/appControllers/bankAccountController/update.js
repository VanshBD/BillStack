const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const schema = require('./schemaValidate');

const update = async (req, res) => {
  console.log('🔥 BANK ACCOUNT UPDATE CONTROLLER CALLED!');
  console.log('🔥 Request params:', req.params);
  console.log('🔥 Request body:', req.body);
  console.log('🔥 req.admin:', req.admin);

  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid or missing ID:', id);
      return res.status(400).json({ success: false, result: null, message: 'Invalid or missing id' });
    }

    const body = req.body || {};
    const { error, value } = schema.validate(body);
    if (error) {
      console.log('❌ Validation error:', error.details[0]?.message);
      const { details } = error;
      return res.status(400).json({ success: false, result: null, message: details[0]?.message });
    }

    console.log('✅ Validation passed, updating bank account...');

    // Role check: only owner, admin or inventory_manager can update bank accounts (same as StockMovement)
    const allowedRoles = ['owner', 'admin', 'inventory_manager'];
    if (!req.admin || !req.admin.role || !allowedRoles.includes(req.admin.role)) {
      console.log('❌ Unauthorized update attempt by role:', req.admin?.role);
      return res.status(403).json({ success: false, result: null, message: 'Insufficient role to update bank account' });
    }

    // Fetch the current bank account being updated
    const currentBankAccount = await Model.findOne({ _id: id, removed: false });
    if (currentBankAccount) {
      // Force isDefault to false if the bank account is disabled
      if (value.enabled === false) {
        value.isDefault = false;
      }

      // If the default status is lost (either disabled or explicitly unset),
      // we promote the next in line active enabled bank account to default.
      const lostDefaultStatus =
        (currentBankAccount.isDefault && value.isDefault === false) ||
        (currentBankAccount.isDefault && value.enabled === false);

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

    // If this is set as default, unset other default bank accounts
    if (value.isDefault) {
      await Model.updateMany(
        { removed: false, isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    console.log('🔍 Finding bank account:', id);
    const updated = await Model.findOneAndUpdate({ _id: id }, { $set: { ...value, updated: new Date() } }, { new: true }).populate('createdBy').exec();
    if (!updated) {
      console.log('❌ Bank account not found:', id);
      return res.status(404).json({ success: false, result: null, message: 'Bank account not found' });
    }

    console.log('✅ Bank account updated successfully:', updated._id);
    return res.status(200).json({ success: true, result: updated, message: 'Bank account updated successfully' });
  } catch (error) {
    console.error('❌ Error updating bank account:', error);
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = update;
