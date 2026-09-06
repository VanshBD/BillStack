const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, items, search = '' } = req.query;
    const actualLimit = items || limit;
    const skip = (page - 1) * actualLimit;

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

    if (req.admin && req.admin._id) {
      searchQuery.createdBy = req.admin._id;
    }

    let bankAccounts = await Model.find(searchQuery)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 })
      .skip(skip)
      .limit(parseInt(actualLimit));

    let total = await Model.countDocuments(searchQuery);

    if (total === 0 && !search && req.admin && req.admin._id) {
      const defaultAccount = await new Model({
        accountHolderName: `${req.admin.name || ''} ${req.admin.surname || ''}`.trim() || 'Account Holder',
        bankName: 'Main Bank Account',
        accountNumber: '123456789012',
        ifscCode: 'BANK0001234',
        branchName: 'Main Branch',
        isDefault: true,
        enabled: true,
        createdBy: req.admin._id,
        created: new Date(),
        updated: new Date()
      }).save();

      bankAccounts = [defaultAccount];
      total = 1;
    }

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
