const Joi = require('joi');

module.exports = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  number: Joi.number().integer().positive().required(),
  year: Joi.number().integer().min(2000).max(9999).required(),
  status: Joi.string().required(),
  notes: Joi.string().allow(''),
  expiredDate: Joi.date().greater(Joi.ref('date')).allow(null, '').optional(),
  date: Joi.date().required(),
  companyGstNumber: Joi.string().allow('').optional(),
  taxType: Joi.string().valid('igst', 'cgst_sgst').default('cgst_sgst').optional(),
  termsAndConditions: Joi.string().allow('').optional(),
  selectedTermsId: Joi.string().allow('').optional(),
  selectedBankAccountId: Joi.string().allow('').optional(),
  selectedBankDetails: Joi.object({
    bankName: Joi.string().allow('').optional(),
    bankAccount: Joi.string().allow('').optional(),
    bankBranch: Joi.string().allow('').optional(),
    bankIfsc: Joi.string().allow('').optional(),
    accountHolderName: Joi.string().allow('').optional(),
  }).optional(),
  items: Joi.array().max(100).items(
    Joi.object({
      _id: Joi.string().allow('').optional(),
      itemName: Joi.string().required(),
      description: Joi.string().allow(''),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
      total: Joi.number().required(),
      taxCategory: Joi.string().allow('', null).optional(),
      taxRate: Joi.number().min(0).max(100).default(0).optional(),
      taxAmount: Joi.number().default(0).optional(),
    }).required()
  ).required(),
  taxRate: Joi.number().min(0).max(100).default(0).optional(),
});
