const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const listAll = async (req, res) => {
  try {
    const query = { removed: false };
    if (req.admin && req.admin._id) {
      query.createdBy = req.admin._id;
    }

    let terms = await Model.find(query)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 });

    if (terms.length === 0 && req.admin && req.admin._id) {
      const defaultTerm = await new Model({
        title: 'Standard Payment & Invoice Terms',
        content: '1. Payment is due within 15 days from the date of invoice.\n2. Overdue payments will incur an interest charge of 1.5% per month.\n3. Goods or services once delivered/rendered cannot be returned or cancelled without written authorization.',
        isDefault: true,
        enabled: true,
        type: 'invoice',
        createdBy: req.admin._id,
        created: new Date(),
        updated: new Date()
      }).save();

      terms = [defaultTerm];
    }

    return res.status(200).json({
      success: true,
      result: terms,
      message: 'All terms and conditions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching all terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to fetch all terms and conditions',
    });
  }
};

module.exports = listAll;
