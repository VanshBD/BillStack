const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const summary = async (req, res) => {
  try {
    const totalAccounts = await Model.countDocuments({ removed: false });
    const defaultAccounts = await Model.countDocuments({ removed: false, isDefault: true });
    const customAccounts = totalAccounts - defaultAccounts;
    
    // Get accounts created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAccounts = await Model.countDocuments({
      removed: false,
      created: { $gte: thirtyDaysAgo }
    });

    return res.status(200).json({
      success: true,
      result: {
        totalAccounts,
        defaultAccounts,
        customAccounts,
        recentAccounts
      },
      message: 'Summary retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting bank accounts summary:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to get summary',
    });
  }
};

module.exports = summary;
