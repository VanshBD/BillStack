const Joi = require('joi');

module.exports = Joi.object({
  taxName: Joi.string().trim().required(),
  taxValue: Joi.number().min(0).max(100).required(),
  enabled: Joi.boolean().default(true),
  isDefault: Joi.boolean().default(false),
});
