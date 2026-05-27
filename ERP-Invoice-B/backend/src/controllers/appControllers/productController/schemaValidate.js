const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().allow('').max(1000),
  taxCategory: Joi.string().required(),
  price: Joi.number().required().min(0),
  currency: Joi.string().default('INR').max(3),
  hsnCode: Joi.string().allow('').default('').max(20),
  unit: Joi.string().allow('').default('pcs').max(20),
  sku: Joi.string().optional(),
  enabled: Joi.boolean().default(true),
});

module.exports = schema;
