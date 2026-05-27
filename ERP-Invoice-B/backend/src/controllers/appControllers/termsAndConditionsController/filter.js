const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const filter = async (req, res) => {
  try {
    const { isDefault, createdBy, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filterQuery = {
      removed: false,
      ...(isDefault !== undefined && { isDefault: isDefault === 'true' }),
      ...(createdBy && { createdBy: mongoose.Types.ObjectId(createdBy) })
    };

    const results = await Model.find(filterQuery)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Model.countDocuments(filterQuery);

    return res.status(200).json({
      success: true,
      result: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Filter completed successfully',
    });
  } catch (error) {
    console.error('Error filtering terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Filter failed',
    });
  }
};

module.exports = filter;
