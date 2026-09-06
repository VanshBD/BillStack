const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');
const ModelPayment = mongoose.model('Payment');

const remove = async (req, res) => {
  const query = { _id: req.params.id, removed: false };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const invoiceDoc = await Model.findOne(query);
  if (!invoiceDoc) {
    return res.status(404).json({ success: false, result: null, message: 'Invoice not found' });
  }

  if (invoiceDoc.createdBy && req.admin && req.admin._id && invoiceDoc.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to delete this invoice' });
  }

  const deletedInvoice = await Model.findOneAndUpdate(
    query,
    {
      $set: {
        removed: true,
      },
    }
  ).exec();

  const paymentsInvoices = await ModelPayment.updateMany(
    { invoice: deletedInvoice._id },
    { $set: { removed: true } }
  );

  return res.status(200).json({
    success: true,
    result: deletedInvoice,
    message: 'Invoice deleted successfully',
  });
};

module.exports = remove;
