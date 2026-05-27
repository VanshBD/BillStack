const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');

const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const { getCompanyGstNumber } = require('@/helpers/gstHelper');
const { getCompanyDetails } = require('@/helpers/companyHelper');
const { getDefaultBankAccount, getBankAccountById } = require('@/helpers/bankHelper');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0 } = value;

  // default
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  //Calculate the items array with subTotal, total, taxTotal
  items.map((item) => {
    let total = calculate.multiply(item['quantity'], item['price']);
    //sub total
    subTotal = calculate.add(subTotal, total);
    //item total
    item['total'] = total;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  body['subTotal'] = subTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;

  let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

  body['paymentStatus'] = paymentStatus;
  body['createdBy'] = req.admin._id;

  // Get company GST number from settings
  const companyGstNumber = await getCompanyGstNumber();
  body['companyGstNumber'] = companyGstNumber;

  // Get company details for comprehensive invoice
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
      const defaultTerms = await getDefaultTerms('invoice');
      body['termsAndConditions'] = defaultTerms;
    }
  }

  // Creating a new document in the collection
  const result = await new Model(body).save();
  const fileId = 'invoice-' + result._id + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    {
      new: true,
    }
  ).exec();
  // Returning successfull response

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Invoice created successfully',
  });
};

module.exports = create;
