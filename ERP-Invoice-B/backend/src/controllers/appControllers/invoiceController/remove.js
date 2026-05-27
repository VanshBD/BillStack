const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');
const ModelPayment = mongoose.model('Payment');

const remove = async (req, res) => {
  // find invoice first to check permission
  const invoiceDoc = await Model.findOne({ _id: req.params.id, removed:false });
  if (!invoiceDoc) {
    return res.status(404).json({ success:false, result:null, message:'Invoice not found' });
  }
  if (req.admin.role !== 'owner' && invoiceDoc.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success:false, result:null, message:'Not authorized to delete this invoice' });
  }

  const deletedInvoice = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    {
      $set: {
        removed: true,
      },
    }
  ).exec();

  // cascade soft-delete payments related to invoice
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
