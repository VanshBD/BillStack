const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().required().min(2).max(200),
  content: Joi.string().required().min(10).max(5000),
  isDefault: Joi.boolean().default(false),
  enabled: Joi.boolean().default(true),
});

module.exports = schema;
