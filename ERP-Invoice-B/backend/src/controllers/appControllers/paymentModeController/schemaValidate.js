const Joi = require('joi');

module.exports = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  ref: Joi.string().allow('', null),
  enabled: Joi.boolean().default(true),
  isDefault: Joi.boolean().default(false),
});
