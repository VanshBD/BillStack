const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const listAll = async (req, res) => {
  try {
    const terms = await Model.find({ removed: false })
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 });

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
