const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const summary = async (req, res) => {
  try {
    const baseQuery = { removed: false };
    if (req.admin && req.admin._id) {
      baseQuery.createdBy = req.admin._id;
    }

    const totalAccounts = await Model.countDocuments(baseQuery);
    const defaultAccounts = await Model.countDocuments({ ...baseQuery, isDefault: true });
    const customAccounts = totalAccounts - defaultAccounts;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAccounts = await Model.countDocuments({
      ...baseQuery,
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
