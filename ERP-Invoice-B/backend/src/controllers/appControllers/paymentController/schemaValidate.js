const Joi = require('joi');

module.exports = Joi.object({
  number: Joi.number().integer().positive().required(),
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  invoice: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  date: Joi.date().required(),
  amount: Joi.number().positive().required(),
  paymentMode: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  ref: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
});
