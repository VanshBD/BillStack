const mongoose = require('mongoose');

const Model = mongoose.model('Payment');
const Invoice = mongoose.model('Invoice');
const custom = require('@/controllers/pdfController');
const schema = require('./schemaValidate');

const { calculate } = require('@/helpers');

const update = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, result: null, message: error.details[0]?.message });
  }
  req.body = value;

  if (req.body.amount === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    });
  }

  const query = { _id: req.params.id, removed: false };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const previousPayment = await Model.findOne(query).populate('invoice');

  if (!previousPayment) {
    return res.status(404).json({ success: false, result: null, message: 'Payment not found' });
  }
  if (previousPayment.createdBy && req.admin && req.admin._id && previousPayment.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to update this payment' });
  }

  const { amount: previousAmount } = previousPayment;
  const { id: invoiceId, total, discount, credit: previousCredit } = previousPayment.invoice;

  const { amount: currentAmount } = req.body;

  const changedAmount = calculate.sub(currentAmount, previousAmount);
  const maxAmount = calculate.sub(total, calculate.add(discount, previousCredit));

  if (changedAmount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount + previousAmount}`,
      error: `The Max Amount you can add is ${maxAmount + previousAmount}`,
    });
  }

  let paymentStatus =
    calculate.sub(total, discount) === calculate.add(previousCredit, changedAmount)
      ? 'paid'
      : calculate.add(previousCredit, changedAmount) > 0
      ? 'partially'
      : 'unpaid';

  const updatedDate = new Date();
  const updates = {
    number: req.body.number,
    date: req.body.date,
    amount: req.body.amount,
    paymentMode: req.body.paymentMode,
    ref: req.body.ref,
    description: req.body.description,
    updated: updatedDate,
  };

  const result = await Model.findOneAndUpdate(
    query,
    { $set: updates },
    {
      new: true,
    }
  ).exec();

  const updateInvoice = await Invoice.findOneAndUpdate(
    { _id: result.invoice._id.toString() },
    {
      $inc: { credit: changedAmount },
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
    message: 'Successfully updated the Payment',
  });
};

module.exports = update;
