const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const read = async (req, res) => {
  try {
    const { id } = req.params;
    
    const terms = await Model.findOne({ _id: id, removed: false, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) })
      .populate('createdBy', 'name email');
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Terms and conditions not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      result: terms,
      message: 'Terms and conditions retrieved successfully',
    });
  } catch (error) {
    console.error('Error reading terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to read terms and conditions',
    });
  }
};

module.exports = read;
