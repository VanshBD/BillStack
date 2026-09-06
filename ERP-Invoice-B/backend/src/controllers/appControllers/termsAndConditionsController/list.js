const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, items, search = '' } = req.query;
    const actualLimit = items || limit;
    const skip = (page - 1) * actualLimit;

    const searchQuery = {
      removed: false,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      })
    };

    if (req.admin && req.admin._id) {
      searchQuery.createdBy = req.admin._id;
    }

    let terms = await Model.find(searchQuery)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 })
      .skip(skip)
      .limit(parseInt(actualLimit));

    let total = await Model.countDocuments(searchQuery);

    if (total === 0 && !search && req.admin && req.admin._id) {
      const defaultTerm = await new Model({
        title: 'Standard Payment & Invoice Terms',
        content: '1. Payment is due within 15 days from the date of invoice.\n2. Overdue payments will incur an interest charge of 1.5% per month.\n3. Goods or services once delivered/rendered cannot be returned or cancelled without written authorization.',
        isDefault: true,
        enabled: true,
        type: 'invoice',
        createdBy: req.admin._id,
        created: new Date(),
        updated: new Date()
      }).save();

      terms = [defaultTerm];
      total = 1;
    }

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
