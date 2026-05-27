const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow('').optional(),
  enabled: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  description: Joi.string().allow('').optional(),
  enabled: Joi.boolean().optional(),
});

module.exports = { createSchema, updateSchema };
