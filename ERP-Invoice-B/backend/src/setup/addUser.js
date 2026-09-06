require('module-alias/register');
const config = require('../config');
const { globSync } = require('glob');
const fs = require('fs');
const path = require('path');
const { generate: uniqueId } = require('shortid');
const mongoose = require('mongoose');

const mongoUri = process.env.DATABASE || config.database || 'mongodb+srv://vanshbdobariya1312_db_user:K0XVpBgi9teXHvVE@cluster0.wun90oc.mongodb.net/billstack-db?retryWrites=true&w=majority';

// ── New user details ────────────────────────────────────────────
const NEW_USER = {
  email: 'dobariyaenterprish@gmail.com',
  name: 'Bhavesh',
  surname: 'Dobariya',
  role: 'owner',
  enabled: true,
  password: 'DOBA@3611',
};

async function addUser() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to DB: ${mongoose.connection.name}`);

    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');

    let adminRecord = await Admin.findOne({ email: NEW_USER.email.toLowerCase(), removed: false });
    if (adminRecord) {
      console.log(`ℹ️ User with email "${NEW_USER.email}" already exists. Updating password...`);
    } else {
      adminRecord = await new Admin({
        email: NEW_USER.email,
        name: NEW_USER.name,
        surname: NEW_USER.surname,
        role: NEW_USER.role,
        enabled: NEW_USER.enabled,
      }).save();
      console.log(`✅ Admin created: ${NEW_USER.name} ${NEW_USER.surname} <${NEW_USER.email}>`);
    }

    const passwordDoc = new AdminPassword();
    const salt = uniqueId();
    const passwordHash = passwordDoc.generateHash(salt, NEW_USER.password);

    await AdminPassword.findOneAndUpdate(
      { user: adminRecord._id },
      {
        password: passwordHash,
        salt: salt,
        emailVerified: true,
        user: adminRecord._id,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Password set/updated successfully!`);

    await seedDefaultSettings(adminRecord._id);

    console.log('\n🎉 Live User Setup Complete!');
    console.log(`   Email    : ${NEW_USER.email}`);
    console.log(`   Password : ${NEW_USER.password}`);
    console.log(`   Role     : ${NEW_USER.role}`);
    process.exit(0);
  } catch (err) {
    console.error('\n🚫 Error during user creation:', err.message);
    console.error(err);
    process.exit(1);
  }
}

async function seedDefaultSettings(adminId) {
  const Setting = require('../models/coreModels/Setting');

  const settingCount = await Setting.countDocuments({ removed: false });
  if (settingCount === 0) {
    const settingFiles = [];
    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      try {
        const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(file)) settingFiles.push(...file);
      } catch (e) { /* skip */ }
    }

    const actualSettings = settingFiles.filter(s => s && s.settingKey);
    if (actualSettings.length > 0) {
      await Setting.insertMany(actualSettings);
      console.log(`✅ Default settings seeded: ${actualSettings.length} records`);
    }
  }

  const BankAccount = require('../models/appModels/BankAccount');
  const bankCount = await BankAccount.countDocuments({ createdBy: adminId, removed: false });
  if (bankCount === 0) {
    const bankFiles = globSync('./src/setup/defaultSettings/bankAccounts.json');
    if (bankFiles.length > 0) {
      const bankData = JSON.parse(fs.readFileSync(bankFiles[0], 'utf-8'));
      if (Array.isArray(bankData) && bankData.length > 0) {
        await BankAccount.insertMany(bankData.map(b => ({ ...b, createdBy: adminId })));
        console.log(`✅ Default bank accounts seeded: ${bankData.length} records`);
      }
    }
  }

  const TermsAndConditions = require('../models/appModels/TermsAndConditions');
  const termsCount = await TermsAndConditions.countDocuments({ createdBy: adminId, removed: false });
  if (termsCount === 0) {
    const termsFiles = globSync('./src/setup/defaultSettings/termsAndConditions.json');
    if (termsFiles.length > 0) {
      const termsData = JSON.parse(fs.readFileSync(termsFiles[0], 'utf-8'));
      if (Array.isArray(termsData) && termsData.length > 0) {
        await TermsAndConditions.insertMany(termsData.map(t => ({ ...t, createdBy: adminId })));
        console.log(`✅ Default terms seeded: ${termsData.length} records`);
      }
    }
  }

  const Taxes = require('../models/appModels/Taxes');
  const taxCount = await Taxes.countDocuments({ removed: false });
  if (taxCount === 0) {
    await Taxes.insertMany([
      { taxName: 'GST 18%', taxValue: 18, isDefault: true },
      { taxName: 'Tax 0%', taxValue: 0, isDefault: false },
    ]);
    console.log(`✅ Default taxes seeded: GST 18% & Tax 0%`);
  }

  const PaymentMode = require('../models/appModels/PaymentMode');
  const pmCount = await PaymentMode.countDocuments({ removed: false });
  if (pmCount === 0) {
    await PaymentMode.insertMany([{
      name: 'Bank Transfer / UPI',
      description: 'Direct Bank Wire Transfer or UPI Payment',
      isDefault: true,
    }]);
    console.log(`✅ Payment modes seeded`);
  }
}

addUser();
