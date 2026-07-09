const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const custom = require('@/controllers/pdfController');

const { calculate } = require('@/helpers');
const { autoDetectTaxType } = require('@/helpers/gstHelper');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  // Permission check first — before any DB work
  const previousInvoice = await Model.findOne({
    _id: req.params.id,
    removed: false,
  });
  if (!previousInvoice) {
    return res.status(404).json({ success: false, result: null, message: 'Invoice not found' });
  }
  if (req.admin.role !== 'owner' && previousInvoice.createdBy.toString() !== req.admin._id.toString()) {
    return res.status(403).json({ success: false, result: null, message: 'Not authorized to update this invoice' });
  }
  const { credit } = previousInvoice;

  // Use Joi-validated value so coercion/defaults are applied
  let body = { ...value };
  const { items = [], discount = 0 } = body;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  // Determine tax type (IGST or CGST+SGST)
  const clientId = typeof value.client === 'object' ? value.client._id || value.client : value.client;
  const invoiceTaxType = body.taxType || await autoDetectTaxType(clientId);
  body['taxType'] = invoiceTaxType;

  // Calculate per-item totals and build tax breakdown
  let subTotal = 0;
  let totalTaxAmount = 0;
  const taxBreakdownMap = new Map(); // key: `${taxCategoryId}_${taxRate}`

  for (const item of items) {
    const itemLineTotal = calculate.multiply(item.quantity, item.price);
    subTotal = calculate.add(subTotal, itemLineTotal);
    item.total = itemLineTotal;

    // Per-item tax
    const itemTaxRate = (typeof item.taxRate === 'number') ? item.taxRate : 0;
    const itemTaxAmount = calculate.multiply(itemLineTotal, itemTaxRate / 100);
    item.taxAmount = itemTaxAmount;
    totalTaxAmount = calculate.add(totalTaxAmount, itemTaxAmount);

    // Group by taxCategory + rate for breakdown
    if (itemTaxRate > 0) {
      const categoryKey = item.taxCategory ? item.taxCategory.toString() : 'no-category';
      const mapKey = `${categoryKey}_${itemTaxRate}`;
      if (!taxBreakdownMap.has(mapKey)) {
        taxBreakdownMap.set(mapKey, {
          taxCategoryId: item.taxCategory || null,
          taxCategoryName: '',
          taxRate: itemTaxRate,
          taxType: invoiceTaxType,
          taxableAmount: 0,
          totalTaxAmount: 0,
          cgstRate: 0,
          sgstRate: 0,
          igstRate: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
        });
      }
      const bd = taxBreakdownMap.get(mapKey);
      bd.taxableAmount = calculate.add(bd.taxableAmount, itemLineTotal);
      bd.totalTaxAmount = calculate.add(bd.totalTaxAmount, itemTaxAmount);
    }
  }

  // Resolve tax category names and split CGST/SGST vs IGST
  const Taxes = mongoose.model('Taxes');
  const taxBreakdown = [];
  for (const [mapKey, bd] of taxBreakdownMap) {
    if (bd.taxCategoryId) {
      try {
        const taxDoc = await Taxes.findById(bd.taxCategoryId);
        if (taxDoc) bd.taxCategoryName = taxDoc.taxName;
      } catch (e) { /* ignore */ }
    } else {
      bd.taxCategoryName = `Tax ${bd.taxRate}%`;
    }

    if (bd.taxType === 'cgst_sgst') {
      bd.cgstRate = bd.taxRate / 2;
      bd.sgstRate = bd.taxRate / 2;
      bd.igstRate = 0;
      bd.cgstAmount = bd.totalTaxAmount / 2;
      bd.sgstAmount = bd.totalTaxAmount / 2;
      bd.igstAmount = 0;
    } else {
      bd.cgstRate = 0;
      bd.sgstRate = 0;
      bd.igstRate = bd.taxRate;
      bd.cgstAmount = 0;
      bd.sgstAmount = 0;
      bd.igstAmount = bd.totalTaxAmount;
    }
    taxBreakdown.push(bd);
  }

  const total = calculate.add(subTotal, totalTaxAmount);

  body['subTotal'] = subTotal;
  body['taxTotal'] = totalTaxAmount;
  body['total'] = total;
  body['items'] = items;
  body['taxBreakdown'] = taxBreakdown;
  // Keep legacy taxRate for backward compat
  if (!body['taxRate'] && items.length > 0 && items[0].taxRate) {
    body['taxRate'] = items[0].taxRate;
  }

  body['pdf'] = 'invoice-' + req.params.id + '.pdf';
  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  // Find document by id and updates with the required fields

  let paymentStatus =
    calculate.sub(total, discount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';
  body['paymentStatus'] = paymentStatus;

  const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
    new: true, // return the new result instead of the old one
  }).exec();

  // Returning successfull response

  return res.status(200).json({
    success: true,
    result,
    message: 'we update this document ',
  });
};

module.exports = update;
