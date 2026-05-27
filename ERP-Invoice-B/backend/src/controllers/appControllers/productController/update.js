const mongoose = require('mongoose');

const Model = mongoose.model('Product');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        result: null, 
        message: 'Invalid or missing product ID' 
      });
    }

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
    
    // Remove SKU from request body to prevent modification
    delete value.sku;
    
    const updated = await Model.findOneAndUpdate({ _id: id }, { $set: value }, { new: true }).populate('createdBy').exec();
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        result: null, 
        message: 'Product not found' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      result: updated, 
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to update product' 
    });
  }
};

module.exports = update;
