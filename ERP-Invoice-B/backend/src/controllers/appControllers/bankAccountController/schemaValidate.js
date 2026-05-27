const Joi = require('joi');

const schema = Joi.object({
  bankName: Joi.string().required().min(2).max(100),
  accountNumber: Joi.string().required().min(5).max(50),
  accountHolderName: Joi.string().required().min(2).max(100),
  branchName: Joi.string().required().min(2).max(100),
  ifscCode: Joi.string().required().min(5).max(20),
  isDefault: Joi.boolean().default(false),
  description: Joi.string().allow('').max(500),
  enabled: Joi.boolean().default(true),
});

module.exports = schema;
