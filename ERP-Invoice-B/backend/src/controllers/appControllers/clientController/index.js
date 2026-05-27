const mongoose = require('mongoose');
const Joi = require('joi');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const summary = require('./summary');

function modelController() {
  const Model = mongoose.model('Client');
  const crudMethods = createCRUDController('Client');
  const methods = { ...crudMethods };

  // Validation schema
  const baseSchema = {
    name: Joi.string().trim().required(),
    phone: Joi.string().trim().allow('', null),
    gstNumber: Joi.string().trim().allow('', null),
    country: Joi.string().required(),
    state: Joi.string().required(),
    stateCode: Joi.string().required(),
    billingAddress: Joi.string().required(),
    shippingAddress: Joi.string().trim().allow('', null),
    isShippingSameAsBilling: Joi.boolean().default(true),
    email: Joi.string().email().lowercase().trim().allow('', null),
    enabled: Joi.boolean(),
    // Legacy fields for internal sync
    address: Joi.string().allow('', null),
    gst: Joi.string().allow('', null),
  };

  const createSchema = Joi.object(baseSchema);
  const updateSchema = Joi.object({
    ...baseSchema,
    name: Joi.string().trim(),
    country: Joi.string(),
    state: Joi.string(),
    stateCode: Joi.string(),
    billingAddress: Joi.string(),
  }).min(1);

  // Override create with validation
  methods.create = async (req, res) => {
    let { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    // Convert empty strings to null for unique fields
    if (value.phone === '') value.phone = null;
    if (value.email === '') value.email = null;

    if (value.isShippingSameAsBilling) {
      value.shippingAddress = value.billingAddress;
    }

    // Sync legacy fields
    value.address = value.billingAddress;
    value.gst = value.gstNumber;
    
    req.body = value;
    return crudMethods.create(req, res);
  };

  // Override update with validation
  methods.update = async (req, res) => {
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    // Convert empty strings to null for unique fields
    if (value.phone === '') value.phone = null;
    if (value.email === '') value.email = null;

    if (value.isShippingSameAsBilling !== undefined && value.isShippingSameAsBilling) {
      if (value.billingAddress) {
        value.shippingAddress = value.billingAddress;
      }
    }

    // Sync legacy fields if they are being updated
    if (value.billingAddress) value.address = value.billingAddress;
    if (value.gstNumber) value.gst = value.gstNumber;
    
    req.body = value;
    return crudMethods.update(req, res);
  };

  methods.summary = (req, res) => summary(Model, req, res);
  return methods;
}

module.exports = modelController();
