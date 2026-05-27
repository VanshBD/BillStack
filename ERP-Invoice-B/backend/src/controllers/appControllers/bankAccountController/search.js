const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const search = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = {
      removed: false,
      ...(search && {
        $or: [
          { bankName: { $regex: search, $options: 'i' } },
          { accountHolderName: { $regex: search, $options: 'i' } },
          { branchName: { $regex: search, $options: 'i' } },
          { ifscCode: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const results = await Model.find(searchQuery)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Model.countDocuments(searchQuery);

    return res.status(200).json({
      success: true,
      result: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Search completed successfully',
    });
  } catch (error) {
    console.error('Error searching bank accounts:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Search failed',
    });
  }
};

module.exports = search;
