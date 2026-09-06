const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const summary = async (req, res) => {
  try {
    const baseQuery = { removed: false };
    if (req.admin && req.admin._id) {
      baseQuery.createdBy = req.admin._id;
    }

    const totalTerms = await Model.countDocuments(baseQuery);
    const defaultTerms = await Model.countDocuments({ ...baseQuery, isDefault: true });
    const customTerms = totalTerms - defaultTerms;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTerms = await Model.countDocuments({
      ...baseQuery,
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
