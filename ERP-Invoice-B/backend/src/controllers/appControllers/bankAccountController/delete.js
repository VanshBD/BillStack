const mongoose = require('mongoose');

const Model = mongoose.model('BankAccount');
const { deleteBankAccount } = require('@/helpers/bankHelper');

const deleteBankAccountController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await deleteBankAccount(id);
    
    return res.status(200).json({
      success: true,
      result: result,
      message: 'Bank account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to delete bank account',
    });
  }
};

module.exports = deleteBankAccountController;
