const Joi = require('joi');

const createSchema = Joi.object({
  product: Joi.string().required(),
  type: Joi.string().valid('in', 'out', 'adjustment').required(),
  quantity: Joi.number().min(0).required(),
  referenceModel: Joi.string().allow('', null),
  referenceId: Joi.string().allow('', null),
  reason: Joi.string().allow('', null),
  allowNegative: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  type: Joi.string().valid('in', 'out', 'adjustment').optional(),
  quantity: Joi.number().min(0).optional(),
  referenceModel: Joi.string().allow('', null).optional(),
  referenceId: Joi.string().allow('', null).optional(),
  reason: Joi.string().allow('', null).optional(),
});

module.exports = { createSchema, updateSchema };
