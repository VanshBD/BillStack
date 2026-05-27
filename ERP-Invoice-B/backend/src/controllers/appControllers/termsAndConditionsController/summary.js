const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const summary = async (req, res) => {
  try {
    const totalTerms = await Model.countDocuments({ removed: false });
    const defaultTerms = await Model.countDocuments({ removed: false, isDefault: true });
    const customTerms = totalTerms - defaultTerms;
    
    // Get terms created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTerms = await Model.countDocuments({
      removed: false,
      created: { $gte: thirtyDaysAgo }
    });

    return res.status(200).json({
      success: true,
      result: {
        totalTerms,
        defaultTerms,
        customTerms,
        recentTerms
      },
      message: 'Summary retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting terms summary:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to get summary',
    });
  }
};

module.exports = summary;
