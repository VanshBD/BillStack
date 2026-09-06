const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');
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

    const allowedRoles = ['owner', 'admin', 'inventory_manager'];
    if (!req.admin || !req.admin.role || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, result: null, message: 'Insufficient role to update bank account' });
    }

    const query = { _id: id, removed: false };
    if (req.admin && req.admin._id) {
      query.createdBy = req.admin._id;
    }

    // Fetch current bank account scoped to this user
    const currentBankAccount = await Model.findOne(query);
    if (!currentBankAccount) {
      return res.status(404).json({ success: false, result: null, message: 'Bank account not found' });
    }

    if (value.enabled === false) {
      value.isDefault = false;
    }

    const lostDefaultStatus =
      (currentBankAccount.isDefault && value.isDefault === false) ||
      (currentBankAccount.isDefault && value.enabled === false);

    if (lostDefaultStatus) {
      const nextDefaultQuery = {
        _id: { $ne: id },
        removed: false,
        enabled: true,
      };
      if (req.admin && req.admin._id) {
        nextDefaultQuery.createdBy = req.admin._id;
      }
      const nextDefault = await Model.findOne(nextDefaultQuery).sort({ created: -1 });
      if (nextDefault) {
        await Model.updateOne({ _id: nextDefault._id }, { isDefault: true });
      }
    }

    // If this account is being set as default, unset default for this user's other accounts ONLY
    if (value.isDefault) {
      const unsetQuery = { removed: false, isDefault: true, _id: { $ne: id } };
      if (req.admin && req.admin._id) {
        unsetQuery.createdBy = req.admin._id;
      }
      await Model.updateMany(unsetQuery, { isDefault: false });
    }

    const updated = await Model.findOneAndUpdate(
      query,
      { $set: { ...value, updated: new Date() } },
      { new: true }
    ).populate('createdBy').exec();

    return res.status(200).json({ success: true, result: updated, message: 'Bank account updated successfully' });
  } catch (error) {
    console.error('Error updating bank account:', error);
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = update;
