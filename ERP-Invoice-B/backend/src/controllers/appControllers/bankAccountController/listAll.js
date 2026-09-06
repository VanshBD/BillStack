const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');

const listAll = async (req, res) => {
  try {
    const query = { removed: false };
    if (req.admin && req.admin._id) {
      query.createdBy = req.admin._id;
    }

    let bankAccounts = await Model.find(query)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, created: -1 });

    if (bankAccounts.length === 0 && req.admin && req.admin._id) {
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
    }

    return res.status(200).json({
      success: true,
      result: bankAccounts,
      message: 'All bank accounts retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching all bank accounts:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to fetch all bank accounts',
    });
  }
};

module.exports = listAll;
