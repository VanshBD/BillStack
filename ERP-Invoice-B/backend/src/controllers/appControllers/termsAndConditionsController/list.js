const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, items, search = '' } = req.query;
    const actualLimit = items || limit; // Handle both 'items' and 'limit' parameters
    const skip = (page - 1) * actualLimit;

    // Build search query
    const searchQuery = {
      removed: false,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const terms = await Model.find(searchQuery)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 })
      .skip(skip)
      .limit(parseInt(actualLimit));

    const total = await Model.countDocuments(searchQuery);

    return res.status(200).json({
      success: true,
      result: terms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(actualLimit),
        total,
        pages: Math.ceil(total / actualLimit)
      },
      message: 'Terms and conditions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to fetch terms and conditions',
    });
  }
};

module.exports = list;
