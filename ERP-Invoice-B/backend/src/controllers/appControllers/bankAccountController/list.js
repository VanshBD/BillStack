const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');
const { getAllBankAccounts } = require('@/helpers/bankHelper');

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
          { bankName: { $regex: search, $options: 'i' } },
          { accountHolderName: { $regex: search, $options: 'i' } },
          { branchName: { $regex: search, $options: 'i' } },
          { ifscCode: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const bankAccounts = await Model.find(searchQuery)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 })
      .skip(skip)
      .limit(parseInt(actualLimit));

    const total = await Model.countDocuments(searchQuery);
    
    return res.status(200).json({
      success: true,
      result: bankAccounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(actualLimit),
        total,
        pages: Math.ceil(total / actualLimit)
      },
      message: 'Bank accounts retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to fetch bank accounts',
    });
  }
};

module.exports = list;
