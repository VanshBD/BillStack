const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const schema = require('./schemaValidate');

const create = async (req, res) => {
  console.log('🔥 TERMS CREATE CONTROLLER CALLED!');
  console.log('🔥 Request body:', req.body);
  console.log('🔥 req.admin:', req.admin);
  
  try {
    const body = req.body || {};

    const { error, value } = schema.validate(body);
    if (error) {
      console.log('❌ Validation error:', error.details[0]?.message);
      const { details } = error;
      return res.status(400).json({ success: false, result: null, message: details[0]?.message });
    }

    console.log('✅ Validation passed, creating terms...');

    // Enforce that disabled terms cannot be set as default
    if (value.enabled === false) {
      value.isDefault = false;
    }

    // If this is set as default, unset other default terms
    if (value.isDefault) {
      await Model.updateMany(
        { removed: false, isDefault: true },
        { isDefault: false }
      );
    } else {
      // If there are currently no default active terms, make this default if enabled
      const activeDefaultCount = await Model.countDocuments({
        removed: false,
        isDefault: true,
        enabled: true
      });
      if (activeDefaultCount === 0 && value.enabled !== false) {
        value.isDefault = true;
      }
    }

    const newTerms = new Model({
      ...value,
      createdBy: req.admin && req.admin._id ? req.admin._id : null,
      created: new Date(),
      updated: new Date()
    });

    console.log('💾 Saving terms with createdBy:', newTerms.createdBy);
    const result = await newTerms.save();
    
    console.log('✅ Terms saved successfully:', result._id);
    return res.status(200).json({
      success: true,
      result: result,
      message: 'Terms and conditions created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to create terms and conditions',
    });
  }
};

module.exports = create;
