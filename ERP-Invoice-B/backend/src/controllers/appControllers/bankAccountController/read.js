const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const read = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bankAccount = await Model.findOne({ _id: id, removed: false, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) })
      .populate('createdBy', 'name email');
    
    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Bank account not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      result: bankAccount,
      message: 'Bank account retrieved successfully',
    });
  } catch (error) {
    console.error('Error reading bank account:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to read bank account',
    });
  }
};

module.exports = read;
