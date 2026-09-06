const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const restore = async (req, res) => {
  const query = { _id: req.params.id, removed: true };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const invoiceDoc = await Model.findOne(query);
  if (!invoiceDoc) {
    return res.status(404).json({ success: false, result: null, message: 'Invoice not found or already active' });
  }
  if (invoiceDoc.createdBy && req.admin && req.admin._id && invoiceDoc.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to restore this invoice' });
  }

  invoiceDoc.removed = false;
  await invoiceDoc.save();

  return res.status(200).json({ success: true, result: invoiceDoc, message: 'Invoice restored successfully' });
};

module.exports = restore;
