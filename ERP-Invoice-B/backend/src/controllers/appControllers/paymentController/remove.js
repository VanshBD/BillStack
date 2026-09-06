const mongoose = require('mongoose');

const Model = mongoose.model('Payment');
const Invoice = mongoose.model('Invoice');

const remove = async (req, res) => {
  const query = { _id: req.params.id, removed: false };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const previousPayment = await Model.findOne(query).populate('invoice');

  if (!previousPayment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found',
    });
  }

  if (previousPayment.createdBy && req.admin && req.admin._id && previousPayment.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to delete this payment' });
  }

  const { _id: paymentId, amount: previousAmount } = previousPayment;
  const { id: invoiceId, total, discount, credit: previousCredit } = previousPayment.invoice;

  let updates = {
    removed: true,
  };

  const result = await Model.findOneAndUpdate(
    query,
    { $set: updates },
    {
      new: true,
    }
  ).exec();

  let paymentStatus =
    total - discount === previousCredit - previousAmount
      ? 'paid'
      : previousCredit - previousAmount > 0
      ? 'partially'
      : 'unpaid';

  const updateInvoice = await Invoice.findOneAndUpdate(
    { _id: invoiceId },
    {
      $pull: {
        payment: paymentId,
      },
      $inc: { credit: -previousAmount },
      $set: {
        paymentStatus: paymentStatus,
      },
    },
    {
      new: true,
    }
  ).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully Deleted the document',
  });
};

module.exports = remove;
