const mongoose = require('mongoose');

const Model = mongoose.model('Quote');

const remove = async (req, res) => {
  const quoteDoc = await Model.findOne({ _id: req.params.id, removed: false });
  if (!quoteDoc) {
    return res.status(404).json({ success: false, result: null, message: 'Quote not found' });
  }
  if (req.admin.role !== 'owner' && quoteDoc.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to delete this quote' });
  }

  const deleted = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $set: { removed: true } },
    { new: true }
  ).exec();

  return res.status(200).json({ success: true, result: deleted, message: 'Quote deleted successfully' });
};

module.exports = remove;
