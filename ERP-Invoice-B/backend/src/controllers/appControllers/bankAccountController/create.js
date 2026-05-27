const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const schema = require('./schemaValidate');

const create = async (req, res) => {
  console.log('🔥 BANK ACCOUNT CREATE CONTROLLER CALLED!');
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

    console.log('✅ Validation passed, creating bank account...');

    // Enforce that disabled bank accounts cannot be set as default
    if (value.enabled === false) {
      value.isDefault = false;
    }

    // If this is set as default, unset other default bank accounts
    if (value.isDefault) {
      await Model.updateMany(
        { removed: false, isDefault: true },
        { isDefault: false }
      );
    } else {
      // If there are currently no default active bank accounts, make this default if enabled
      const activeDefaultCount = await Model.countDocuments({
        removed: false,
        isDefault: true,
        enabled: true
      });
      if (activeDefaultCount === 0 && value.enabled !== false) {
        value.isDefault = true;
      }
    }

    const newBankAccount = new Model({
      ...value,
      createdBy: req.admin && req.admin._id ? req.admin._id : null,
      created: new Date(),
      updated: new Date()
    });

    console.log('💾 Saving bank account with createdBy:', newBankAccount.createdBy);
    const result = await newBankAccount.save();
    
    console.log('✅ Bank account saved successfully:', result._id);
    return res.status(200).json({
      success: true,
      result: result,
      message: 'Bank account created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating bank account:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to create bank account',
    });
  }
};

module.exports = create;
