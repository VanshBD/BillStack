const mongoose = require('mongoose');

const getAllBankAccounts = async () => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    const bankAccounts = await BankAccount.find({
      removed: false,
      enabled: true
    }).sort({ isDefault: -1, created: -1 });
    
    return bankAccounts;
  } catch (error) {
    console.error('Error fetching bank accounts:', error.message);
    throw new Error('Failed to fetch bank accounts');
  }
};

const getDefaultBankAccount = async () => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    const defaultAccount = await BankAccount.findOne({
      removed: false,
      enabled: true,
      isDefault: true
    });
    
    if (defaultAccount) {
      return defaultAccount;
    }
    
    // If no default account, return the first enabled account
    const firstAccount = await BankAccount.findOne({
      removed: false,
      enabled: true
    }).sort({ created: 1 });
    
    return firstAccount;
  } catch (error) {
    console.error('Error fetching default bank account:', error.message);
    throw new Error('Failed to fetch default bank account');
  }
};

const getBankAccountById = async (bankAccountId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    const bankAccount = await BankAccount.findOne({
      _id: bankAccountId,
      removed: false,
      enabled: true
    });
    
    return bankAccount;
  } catch (error) {
    console.error('Error fetching bank account by ID:', error.message);
    throw new Error('Failed to fetch bank account');
  }
};

const createBankAccount = async (bankData, createdBy) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    
    // If this is set as default, unset other default accounts
    if (bankData.isDefault) {
      await BankAccount.updateMany(
        { removed: false, isDefault: true },
        { isDefault: false }
      );
    }
    
    const newBankAccount = new BankAccount({
      ...bankData,
      createdBy,
      created: new Date(),
      updated: new Date()
    });
    
    return await newBankAccount.save();
  } catch (error) {
    console.error('Error creating bank account:', error.message);
    throw new Error('Failed to create bank account');
  }
};

const updateBankAccount = async (bankAccountId, updateData) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    
    // If this is set as default, unset other default accounts
    if (updateData.isDefault) {
      await BankAccount.updateMany(
        { removed: false, isDefault: true, _id: { $ne: bankAccountId } },
        { isDefault: false }
      );
    }
    
    const updatedAccount = await BankAccount.findOneAndUpdate(
      { _id: bankAccountId, removed: false },
      {
        ...updateData,
        updated: new Date()
      },
      { new: true }
    );
    
    return updatedAccount;
  } catch (error) {
    console.error('Error updating bank account:', error.message);
    throw new Error('Failed to update bank account');
  }
};

const deleteBankAccount = async (bankAccountId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    
    // Don't allow deletion of default account
    const accountToDelete = await BankAccount.findOne({
      _id: bankAccountId,
      removed: false
    });
    
    if (!accountToDelete) {
      throw new Error('Bank account not found');
    }
    
    if (accountToDelete.isDefault) {
      throw new Error('Cannot delete default bank account');
    }
    
    await BankAccount.findOneAndUpdate(
      { _id: bankAccountId },
      { 
        removed: true,
        updated: new Date()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting bank account:', error.message);
    throw new Error('Failed to delete bank account');
  }
};

module.exports = {
  getAllBankAccounts,
  getDefaultBankAccount,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
};
