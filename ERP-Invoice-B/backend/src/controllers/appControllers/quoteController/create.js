const mongoose = require('mongoose');

const Model = mongoose.model('Quote');

const custom = require('@/controllers/pdfController');
const schema = require('./schemaValidate');
const { increaseBySettingKey } = require('@/middlewares/settings');
const { calculate } = require('@/helpers');
const { getCompanyGstNumber, autoDetectTaxType } = require('@/helpers/gstHelper');
const { getCompanyDetails } = require('@/helpers/companyHelper');
const { getDefaultBankAccount, getBankAccountById } = require('@/helpers/bankHelper');
const { checkAndHandleFYRollover, formatInvoiceNumber, safeFileName } = require('@/helpers/financialYearHelper');

const create = async (req, res) => {
  // Verify admin is authenticated
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({
      success: false,
      result: null,
      message: 'Authentication required. Please log in again.',
    });
  }

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success:false, result:null, message:error.details[0]?.message });
  }

  // body must be declared BEFORE it is used
  let body = value;

  const { items = [], discount = 0 } = value;

  // Determine tax type (IGST or CGST+SGST)
  const clientId = typeof value.client === 'object' ? value.client._id || value.client : value.client;
  const quoteTaxType = body.taxType || await autoDetectTaxType(clientId);
  body['taxType'] = quoteTaxType;

  // Calculate per-item totals and build tax breakdown
  let subTotal = 0;
  let totalTaxAmount = 0;
  const taxBreakdownMap = new Map();

  for (const item of items) {
    const itemLineTotal = calculate.multiply(item.quantity, item.price);
    subTotal = calculate.add(subTotal, itemLineTotal);
    item.total = itemLineTotal;

    const itemTaxRate = (typeof item.taxRate === 'number') ? item.taxRate : 0;
    const itemTaxAmount = calculate.multiply(itemLineTotal, itemTaxRate / 100);
    item.taxAmount = itemTaxAmount;
    totalTaxAmount = calculate.add(totalTaxAmount, itemTaxAmount);

    if (itemTaxRate > 0) {
      const categoryKey = item.taxCategory ? item.taxCategory.toString() : 'no-category';
      const mapKey = `${categoryKey}_${itemTaxRate}`;
      if (!taxBreakdownMap.has(mapKey)) {
        taxBreakdownMap.set(mapKey, {
          taxCategoryId: item.taxCategory || null,
          taxCategoryName: '',
          taxRate: itemTaxRate,
          taxType: quoteTaxType,
          taxableAmount: 0,
          totalTaxAmount: 0,
          cgstRate: 0, sgstRate: 0, igstRate: 0,
          cgstAmount: 0, sgstAmount: 0, igstAmount: 0,
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
  for (const [, bd] of taxBreakdownMap) {
    if (bd.taxCategoryId) {
      try {
        const taxDoc = await Taxes.findById(bd.taxCategoryId);
        if (taxDoc) bd.taxCategoryName = taxDoc.taxName;
      } catch (e) { /* ignore */ }
    } else {
      bd.taxCategoryName = `Tax ${bd.taxRate}%`;
    }

    if (bd.taxType === 'cgst_sgst') {
      bd.cgstRate = bd.taxRate / 2;  bd.sgstRate = bd.taxRate / 2;  bd.igstRate = 0;
      bd.cgstAmount = bd.totalTaxAmount / 2;  bd.sgstAmount = bd.totalTaxAmount / 2;  bd.igstAmount = 0;
    } else {
      bd.cgstRate = 0;  bd.sgstRate = 0;  bd.igstRate = bd.taxRate;
      bd.cgstAmount = 0;  bd.sgstAmount = 0;  bd.igstAmount = bd.totalTaxAmount;
    }
    taxBreakdown.push(bd);
  }

  const total = calculate.add(subTotal, totalTaxAmount);

  body['subTotal'] = subTotal;
  body['taxTotal'] = totalTaxAmount;
  body['total'] = total;
  body['items'] = items;
  body['taxBreakdown'] = taxBreakdown;
  if (!body['taxRate'] && items.length > 0 && items[0].taxRate) {
    body['taxRate'] = items[0].taxRate;
  }
  body['createdBy'] = req.admin._id;

  // Check financial year rollover — resets counter if FY has changed
  const fyLabel = await checkAndHandleFYRollover();

  // Build display number: e.g. "12-2025/26"
  const quoteDisplayNumber = formatInvoiceNumber(body.number, fyLabel);
  body['invoiceDisplayNumber'] = quoteDisplayNumber;

  // Get company GST number from settings
  const companyGstNumber = await getCompanyGstNumber();
  body['companyGstNumber'] = companyGstNumber;

  // Get company details for comprehensive quote
  const companyDetails = await getCompanyDetails();
  body['companyDetails'] = companyDetails;

  // Get bank details - use selected bank account or default
  let bankDetails;
  if (body.selectedBankAccountId) {
    bankDetails = await getBankAccountById(body.selectedBankAccountId);
    if (!bankDetails) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Selected bank account not found'
      });
    }
  } else {
    bankDetails = await getDefaultBankAccount();
  }
  
  if (bankDetails) {
    body['selectedBankDetails'] = {
      bankName: bankDetails.bankName,
      bankAccount: bankDetails.accountNumber,
      bankBranch: bankDetails.branchName,
      bankIfsc: bankDetails.ifscCode,
      accountHolderName: bankDetails.accountHolderName
    };
  }

  // Get default terms if not provided
  if (!body.termsAndConditions || body.termsAndConditions.trim() === '') {
    // Try to get default terms from TermsAndConditions model
    const TermsAndConditions = mongoose.model('TermsAndConditions');
    let defaultTerms = await TermsAndConditions.findOne({
      removed: false,
      isDefault: true
    });
    
    if (!defaultTerms) {
      defaultTerms = await TermsAndConditions.findOne({
        removed: false
      }).sort({ created: 1 });
    }
    
    if (defaultTerms) {
      body['termsAndConditions'] = defaultTerms.content;
    } else {
      // Fallback to settings
      const { getDefaultTerms } = require('@/helpers/companyHelper');
      const defaultTerms = await getDefaultTerms('quote');
      body['termsAndConditions'] = defaultTerms;
    }
  }

  // Creating a new document in the collection
  const result = await new Model(body).save();

  // Build proper PDF filename using formatted quote number
  const fileId = safeFileName('quote', quoteDisplayNumber, result._id);

  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();
  // Returning successfull response

  increaseBySettingKey({
    settingKey: 'last_quote_number',
  });

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Quote created successfully',
  });
};
module.exports = create;
