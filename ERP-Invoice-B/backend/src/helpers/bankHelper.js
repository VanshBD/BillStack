const mongoose = require('mongoose');

const getAllBankAccounts = async (adminId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    const query = { removed: false, enabled: true };
    if (adminId) query.createdBy = adminId;

    const bankAccounts = await BankAccount.find(query).sort({ isDefault: -1, created: -1 });
    return bankAccounts;
  } catch (error) {
    console.error('Error fetching bank accounts:', error.message);
    throw new Error('Failed to fetch bank accounts');
  }
};

const getDefaultBankAccount = async (adminId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    const query = { removed: false, enabled: true, isDefault: true };
    if (adminId) query.createdBy = adminId;

    const defaultAccount = await BankAccount.findOne(query);
    if (defaultAccount) {
      return defaultAccount;
    }
    
    // If no default account, return the first enabled account for this admin
    const firstQuery = { removed: false, enabled: true };
    if (adminId) firstQuery.createdBy = adminId;
    const firstAccount = await BankAccount.findOne(firstQuery).sort({ created: 1 });
    
    return firstAccount;
  } catch (error) {
    console.error('Error fetching default bank account:', error.message);
    throw new Error('Failed to fetch default bank account');
  }
};

const getBankAccountById = async (bankAccountId, adminId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    const query = { _id: bankAccountId, removed: false, enabled: true };
    if (adminId) query.createdBy = adminId;

    const bankAccount = await BankAccount.findOne(query);
    return bankAccount;
  } catch (error) {
    console.error('Error fetching bank account by ID:', error.message);
    throw new Error('Failed to fetch bank account');
  }
};

const createBankAccount = async (bankData, createdBy) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    
    // If this is set as default, unset other default accounts for this user ONLY
    if (bankData.isDefault) {
      const unsetQuery = { removed: false, isDefault: true };
      if (createdBy) unsetQuery.createdBy = createdBy;
      await BankAccount.updateMany(unsetQuery, { isDefault: false });
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

const updateBankAccount = async (bankAccountId, updateData, adminId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    
    // If this is set as default, unset other default accounts for this user ONLY
    if (updateData.isDefault) {
      const unsetQuery = { removed: false, isDefault: true, _id: { $ne: bankAccountId } };
      if (adminId) unsetQuery.createdBy = adminId;
      await BankAccount.updateMany(unsetQuery, { isDefault: false });
    }
    
    const updateQuery = { _id: bankAccountId, removed: false };
    if (adminId) updateQuery.createdBy = adminId;

    const updatedAccount = await BankAccount.findOneAndUpdate(
      updateQuery,
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

const deleteBankAccount = async (bankAccountId, adminId) => {
  try {
    const BankAccount = mongoose.model('BankAccount');
    
    const findQuery = { _id: bankAccountId, removed: false };
    if (adminId) findQuery.createdBy = adminId;

    const accountToDelete = await BankAccount.findOne(findQuery);
    
    if (!accountToDelete) {
      throw new Error('Bank account not found');
    }
    
    if (accountToDelete.isDefault) {
      throw new Error('Cannot delete default bank account');
    }
    
    await BankAccount.findOneAndUpdate(
      findQuery,
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
