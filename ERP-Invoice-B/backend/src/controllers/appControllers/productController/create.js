const mongoose = require('mongoose');

const Model = mongoose.model('Product');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  try {
    const body = req.body || {};

    // Validate request body
    const { error, value } = schema.validate(body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        result: null, 
        message: error.details[0]?.message || 'Validation failed' 
      });
    }

    // Remove SKU from request body to prevent manual setting
    delete value.sku;
    
    const newProduct = new Model({
      ...value,
      createdBy: req.admin && req.admin._id ? req.admin._id : null,
      created: new Date(),
      updated: new Date()
    });

    const result = await newProduct.save();
    
    return res.status(200).json({
      success: true,
      result: result,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to create product',
    });
  }
};

module.exports = create;
