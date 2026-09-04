const config = require('../config');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');
const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

async function connectDB() {
  const uris = [
    config.database,
    'mongodb://127.0.0.1:27017/billstack-db',
  ];
  for (const uri of uris) {
    if (!uri) continue;
    try {
      console.log(`Trying to connect to MongoDB: ${uri.split('@').pop()} ...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ Connected to database: ${mongoose.connection.name}`);
      return;
    } catch (e) {
      console.warn(`Could not connect to ${uri.split('@').pop()}: ${e.message}`);
    }
  }
  throw new Error('All MongoDB connection attempts failed.');
}

async function seed() {
  try {
    await connectDB();

    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const Setting = require('../models/coreModels/Setting');
    const Taxes = require('../models/appModels/Taxes');
    const PaymentMode = require('../models/appModels/PaymentMode');
    const BankAccount = require('../models/appModels/BankAccount');
    const TermsAndConditions = require('../models/appModels/TermsAndConditions');
    const Client = require('../models/appModels/Client');
    const Product = require('../models/appModels/Product');
    const Invoice = require('../models/appModels/Invoice');
    const Quote = require('../models/appModels/Quote');

    // 1. Create Default Settings (if not existing)
    const settingsFiles = globSync(path.join(__dirname, 'defaultSettings/**/*.json').replace(/\\/g, '/'));
    const settingFiles = [];
    for (const filePath of settingsFiles) {
      try {
        const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(file)) {
          const actualSettings = file.filter(s => s && s.settingKey && s.settingCategory);
          settingFiles.push(...actualSettings);
        }
      } catch (e) { /* skip */ }
    }
    for (const setting of settingFiles) {
      await Setting.findOneAndUpdate(
        { settingKey: setting.settingKey },
        setting,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Default settings configured');

    // 2. Setup Taxes & Payment Modes
    let defaultTax = await Taxes.findOne({ taxName: 'GST 18%' });
    if (!defaultTax) {
      defaultTax = await Taxes.create({ taxName: 'GST 18%', taxValue: 18, isDefault: true });
    }
    let zeroTax = await Taxes.findOne({ taxName: 'Tax 0%' });
    if (!zeroTax) {
      zeroTax = await Taxes.create({ taxName: 'Tax 0%', taxValue: 0, isDefault: false });
    }
    console.log('✅ Default taxes configured');

    let defaultPaymentMode = await PaymentMode.findOne({ isDefault: true });
    if (!defaultPaymentMode) {
      defaultPaymentMode = await PaymentMode.create({
        name: 'Bank Transfer / UPI',
        description: 'Direct Bank Wire Transfer or UPI Payment',
        isDefault: true,
      });
    }
    console.log('✅ Default payment mode configured');

    // Helper to create Admin account
    async function createAdminUser(email, name, surname, password) {
      let admin = await Admin.findOne({ email });
      if (!admin) {
        admin = new Admin({
          email,
          name,
          surname,
          enabled: true,
          role: 'owner',
        });
        await admin.save();

        const salt = uniqueId();
        const pwdModel = new AdminPassword();
        const hash = pwdModel.generateHash(salt, password);

        await AdminPassword.create({
          password: hash,
          emailVerified: true,
          salt,
          user: admin._id,
        });
        console.log(`✅ Admin Created: ${name} (${email}) | Password: ${password}`);
      } else {
        console.log(`ℹ️ Admin already exists: ${email}`);
      }
      return admin;
    }

    // 3. Create Admin 1 (With Sample Data)
    const admin1 = await createAdminUser('admin1@billstack.com', 'Admin One', 'Sample', 'admin123');

    // 4. Create Admin 2 (Clean / Empty Slate)
    const admin2 = await createAdminUser('admin2@billstack.com', 'Admin Two', 'Clean', 'admin123');

    // 5. Seed Sample Data ONLY for Admin 1
    console.log('\n--- Seeding Sample Data for Admin 1 ---');

    // Sample Clients for Admin 1
    const client1 = await Client.findOneAndUpdate(
      { email: 'finance@techcorp.com', createdBy: admin1._id },
      {
        name: 'TechCorp Solutions Pvt Ltd',
        email: 'finance@techcorp.com',
        phone: '+91 9876543210',
        country: 'India',
        address: '101 Cyber City, Phase 2',
        state: 'Maharashtra',
        stateCode: '27',
        gstNumber: '27AAAAA0000A1Z5',
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    const client2 = await Client.findOneAndUpdate(
      { email: 'billing@acmeretail.in', createdBy: admin1._id },
      {
        name: 'Acme Retail Enterprises',
        email: 'billing@acmeretail.in',
        phone: '+91 9123456789',
        country: 'India',
        address: '45 Commercial Street',
        state: 'Karnataka',
        stateCode: '29',
        gstNumber: '29BBBBB1111B1Z2',
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin 1 Clients created');

    // Sample Products for Admin 1
    const product1 = await Product.findOneAndUpdate(
      { name: 'Enterprise Cloud ERP License', createdBy: admin1._id },
      {
        name: 'Enterprise Cloud ERP License',
        sku: 'ERP-SUB-001',
        description: 'Annual cloud subscription license for ERP software',
        price: 49999,
        currency: 'INR',
        hsnCode: '998313',
        unit: 'Year',
        taxCategory: defaultTax._id,
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    const product2 = await Product.findOneAndUpdate(
      { name: 'Implementation & Onboarding Support', createdBy: admin1._id },
      {
        name: 'Implementation & Onboarding Support',
        sku: 'CONS-OB-002',
        description: 'Professional onboarding, data migration, and team training',
        price: 15000,
        currency: 'INR',
        hsnCode: '998314',
        unit: 'HRS',
        taxCategory: defaultTax._id,
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin 1 Products created');

    // Sample Invoice for Admin 1
    const existingInvoice = await Invoice.findOne({ createdBy: admin1._id, number: 1001 });
    if (!existingInvoice) {
      await Invoice.create({
        number: 1001,
        year: new Date().getFullYear(),
        date: new Date(),
        expiredDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        client: client1._id,
        items: [
          {
            itemName: product1.name,
            description: product1.description,
            quantity: 1,
            price: product1.price,
            taxRate: 18,
            taxAmount: 8999.82,
            total: 58998.82,
          },
        ],
        subTotal: 49999,
        taxTotal: 8999.82,
        total: 58998.82,
        credit: 0,
        discount: 0,
        paymentStatus: 'unpaid',
        status: 'sent',
        createdBy: admin1._id,
      });
      console.log('✅ Admin 1 Sample Invoice created');
    }

    // Sample Quote for Admin 1
    const existingQuote = await Quote.findOne({ createdBy: admin1._id, number: 1001 });
    if (!existingQuote) {
      await Quote.create({
        number: 1001,
        year: new Date().getFullYear(),
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        client: client2._id,
        items: [
          {
            itemName: product2.name,
            description: product2.description,
            quantity: 10,
            price: product2.price,
            taxRate: 18,
            taxAmount: 27000,
            total: 177000,
          },
        ],
        subTotal: 150000,
        taxTotal: 27000,
        total: 177000,
        status: 'pending',
        createdBy: admin1._id,
      });
      console.log('✅ Admin 1 Sample Quote created');
    }

    console.log('\n🎉 Setup & Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log('👤 Admin 1 (With Sample Data):');
    console.log('   Email:    admin1@billstack.com');
    console.log('   Password: admin123');
    console.log('----------------------------------------------------');
    console.log('👤 Admin 2 (Clean / Empty Slate):');
    console.log('   Email:    admin2@billstack.com');
    console.log('   Password: admin123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
