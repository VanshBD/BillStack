const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const getDefault = async (req, res) => {
  try {
    const { type = 'invoice' } = req.query;
    
    // Try to find default terms first
    let defaultTerms = await Model.findOne({ 
      removed: false, 
      isDefault: true 
    }).populate('createdBy', 'name email');
    
    // If no default terms, get the first available terms
    if (!defaultTerms) {
      defaultTerms = await Model.findOne({ 
        removed: false 
      })
      .sort({ created: 1 })
      .populate('createdBy', 'name email');
    }
    
    // If still no terms, return default from settings
    if (!defaultTerms) {
      const Setting = mongoose.model('Setting');
      const settingKey = type === 'invoice' ? 'default_invoice_terms' : 'default_quote_terms';
      
      const termsSetting = await Setting.findOne({
        settingKey: settingKey,
        enabled: true,
        removed: false
      });
      
      if (termsSetting) {
        return res.status(200).json({
          success: true,
          result: {
            _id: 'default',
            title: type === 'invoice' ? 'Default Invoice Terms' : 'Default Quote Terms',
            content: termsSetting.settingValue,
            isDefault: true
          },
          message: 'Default terms and conditions retrieved successfully',
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      result: defaultTerms,
      message: 'Default terms and conditions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching default terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to fetch default terms and conditions',
    });
  }
};

module.exports = getDefault;
