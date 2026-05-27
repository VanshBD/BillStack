const config = require('../config');
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');

const mongoose = require('mongoose');
mongoose.connect(config.database);

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const newAdminPassword = new AdminPassword();

    const salt = uniqueId();

    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'admin@admin.com',
      name: 'BILLSTACK',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const result = await new Admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    await new AdminPassword(AdminPasswordData).save();

    console.log('👍 Admin created : Done!');

    const Setting = require('../models/coreModels/Setting');

    const settingFiles = [];

    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    await Setting.insertMany(settingFiles);

    console.log('👍 Settings created : Done!');

    const BankAccount = require('../models/appModels/BankAccount');
    const bankAccountsFiles = globSync('./src/setup/defaultSettings/bankAccounts.json');
    
    if (bankAccountsFiles.length > 0) {
      const bankAccountsData = JSON.parse(fs.readFileSync(bankAccountsFiles[0], 'utf-8'));
      const adminId = result._id; // Use the created admin ID
      
      const bankAccountsWithCreator = bankAccountsData.map(bankAccount => ({
        ...bankAccount,
        createdBy: adminId,
        created: new Date(),
        updated: new Date()
      }));
      
      await BankAccount.insertMany(bankAccountsWithCreator);
      console.log('👍 Bank Accounts created : Done!');
    }

    const TermsAndConditions = require('../models/appModels/TermsAndConditions');
    const termsFiles = globSync('./src/setup/defaultSettings/termsAndConditions.json');
    
    if (termsFiles.length > 0) {
      const termsData = JSON.parse(fs.readFileSync(termsFiles[0], 'utf-8'));
      const adminId = result._id; // Use the created admin ID
      
      const termsWithCreator = termsData.map(term => ({
        ...term,
        createdBy: adminId,
        created: new Date(),
        updated: new Date()
      }));
      
      await TermsAndConditions.insertMany(termsWithCreator);
      console.log('👍 Terms and Conditions created : Done!');
    }

    const PaymentMode = require('../models/appModels/PaymentMode');
    const Taxes = require('../models/appModels/Taxes');

    await Taxes.insertMany([{ taxName: 'Tax 0%', taxValue: '0', isDefault: true }]);
    console.log('👍 Taxes created : Done!');

    await PaymentMode.insertMany([
      {
        name: 'Default Payment',
        description: 'Default Payment Mode (Cash , Wire Transfert)',
        isDefault: true,
      },
    ]);
    console.log('👍 PaymentMode created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
