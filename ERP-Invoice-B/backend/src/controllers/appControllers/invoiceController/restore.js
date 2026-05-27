const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const restore = async (req, res) => {
  const invoiceDoc = await Model.findOne({ _id: req.params.id, removed: true });
  if (!invoiceDoc) {
    return res.status(404).json({ success: false, result: null, message: 'Invoice not found or already active' });
  }
  if (req.admin.role !== 'owner' && invoiceDoc.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to restore this invoice' });
  }

  invoiceDoc.removed = false;
  await invoiceDoc.save();

  return res.status(200).json({ success: true, result: invoiceDoc, message: 'Invoice restored successfully' });
};

module.exports = restore;
