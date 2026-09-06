const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const getDefault = async (req, res) => {
  try {
    const { type = 'invoice' } = req.query;
    
    const query = { removed: false };
    if (req.admin && req.admin._id) {
      query.createdBy = req.admin._id;
    }

    let defaultTerms = await Model.findOne({ 
      ...query,
      isDefault: true 
    }).populate('createdBy', 'name email');
    
    if (!defaultTerms) {
      defaultTerms = await Model.findOne(query)
      .sort({ created: 1 })
      .populate('createdBy', 'name email');
    }
    
    if (!defaultTerms && req.admin && req.admin._id) {
      defaultTerms = await new Model({
        title: 'Standard Payment & Invoice Terms',
        content: '1. Payment is due within 15 days from the date of invoice.\n2. Overdue payments will incur an interest charge of 1.5% per month.\n3. Goods or services once delivered/rendered cannot be returned or cancelled without written authorization.',
        isDefault: true,
        enabled: true,
        type: type,
        createdBy: req.admin._id,
        created: new Date(),
        updated: new Date()
      }).save();
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
