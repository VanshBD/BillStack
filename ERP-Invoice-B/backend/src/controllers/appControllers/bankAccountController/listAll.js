const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const listAll = async (req, res) => {
  try {
    const bankAccounts = await Model.find({ removed: false })
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 });

    return res.status(200).json({
      success: true,
      result: bankAccounts,
      message: 'All bank accounts retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching all bank accounts:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to fetch all bank accounts',
    });
  }
};

module.exports = listAll;
