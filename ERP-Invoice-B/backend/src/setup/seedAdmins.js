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

    const Payment = require('../models/appModels/Payment');

    // Bank Account for Admin 1
    let bankAccount1 = await BankAccount.findOne({ createdBy: admin1._id, bankName: 'HDFC Bank' });
    if (!bankAccount1) {
      bankAccount1 = await BankAccount.create({
        bankName: 'HDFC Bank',
        accountNumber: '50200088991234',
        accountHolderName: 'BillStack Tech Solutions Pvt Ltd',
        branchName: 'Cyber City Branch, Mumbai',
        ifscCode: 'HDFC0001234',
        isDefault: true,
        description: 'Primary Corporate Operating Account',
        createdBy: admin1._id,
      });
    }
    console.log('✅ Admin 1 Bank Account created');

    // Terms & Conditions for Admin 1
    let terms1 = await TermsAndConditions.findOne({ createdBy: admin1._id, title: 'Standard Payment & Invoice Terms' });
    if (!terms1) {
      terms1 = await TermsAndConditions.create({
        title: 'Standard Payment & Invoice Terms',
        content: '1. Payment is due within 15 days of invoice date.\n2. Late payments are subject to a 1.5% monthly service charge.\n3. Goods or cloud service licenses remain property of seller until paid in full.',
        isDefault: true,
        createdBy: admin1._id,
      });
    }
    console.log('✅ Admin 1 Terms & Conditions created');

    // Sample Clients for Admin 1
    const client1 = await Client.findOneAndUpdate(
      { email: 'finance@techcorp.com', createdBy: admin1._id },
      {
        name: 'TechCorp Solutions Pvt Ltd',
        email: 'finance@techcorp.com',
        phone: '+91 9876543210',
        country: 'India',
        address: '101 Cyber City, Phase 2',
        billingAddress: '101 Cyber City, Phase 2, Mumbai',
        shippingAddress: '101 Cyber City, Phase 2, Mumbai',
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
        billingAddress: '45 Commercial Street, Bengaluru',
        shippingAddress: '45 Commercial Street, Bengaluru',
        state: 'Karnataka',
        stateCode: '29',
        gstNumber: '29BBBBB1111B1Z2',
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    const client3 = await Client.findOneAndUpdate(
      { email: 'accounts@apexglobal.com', createdBy: admin1._id },
      {
        name: 'Apex Global Logistics Ltd',
        email: 'accounts@apexglobal.com',
        phone: '+91 9988776655',
        country: 'India',
        address: '88 Connaught Place, Block B',
        billingAddress: '88 Connaught Place, Block B, New Delhi',
        shippingAddress: '88 Connaught Place, Block B, New Delhi',
        state: 'Delhi',
        stateCode: '07',
        gstNumber: '07CCCCC2222C1Z8',
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    const client4 = await Client.findOneAndUpdate(
      { email: 'billing@zenithhealth.org', createdBy: admin1._id },
      {
        name: 'Zenith Healthcare Solutions',
        email: 'billing@zenithhealth.org',
        phone: '+91 9811223344',
        country: 'India',
        address: '12 HITEC City, Madhapur',
        billingAddress: '12 HITEC City, Madhapur, Hyderabad',
        shippingAddress: '12 HITEC City, Madhapur, Hyderabad',
        state: 'Telangana',
        stateCode: '36',
        gstNumber: '36DDDDD3333D1Z4',
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin 1 Clients created (4 clients)');

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

    const product3 = await Product.findOneAndUpdate(
      { name: 'Dedicated Cloud Server Hosting', createdBy: admin1._id },
      {
        name: 'Dedicated Cloud Server Hosting',
        sku: 'CLOUD-SRV-003',
        description: 'High-performance managed cloud server infrastructure',
        price: 12500,
        currency: 'INR',
        hsnCode: '998315',
        unit: 'Month',
        taxCategory: defaultTax._id,
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    const product4 = await Product.findOneAndUpdate(
      { name: 'Custom API Integration Service', createdBy: admin1._id },
      {
        name: 'Custom API Integration Service',
        sku: 'DEV-API-004',
        description: 'Custom REST API development and third-party webhook connection',
        price: 35000,
        currency: 'INR',
        hsnCode: '998316',
        unit: 'Item',
        taxCategory: defaultTax._id,
        createdBy: admin1._id,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin 1 Products created (4 products)');

    // Sample Invoices for Admin 1
    let invoice1 = await Invoice.findOne({ createdBy: admin1._id, number: 1001 });
    if (!invoice1) {
      invoice1 = await Invoice.create({
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
    }

    let invoice2 = await Invoice.findOne({ createdBy: admin1._id, number: 1002 });
    if (!invoice2) {
      invoice2 = await Invoice.create({
        number: 1002,
        year: new Date().getFullYear(),
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        client: client2._id,
        items: [
          {
            itemName: product2.name,
            description: product2.description,
            quantity: 1,
            price: 12500,
            taxRate: 18,
            taxAmount: 2250,
            total: 14750,
          },
        ],
        subTotal: 12500,
        taxTotal: 2250,
        total: 14750,
        credit: 14750,
        discount: 0,
        paymentStatus: 'paid',
        status: 'sent',
        createdBy: admin1._id,
      });
    }

    let invoice3 = await Invoice.findOne({ createdBy: admin1._id, number: 1003 });
    if (!invoice3) {
      invoice3 = await Invoice.create({
        number: 1003,
        year: new Date().getFullYear(),
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiredDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        client: client3._id,
        items: [
          {
            itemName: product4.name,
            description: product4.description,
            quantity: 1,
            price: product4.price,
            taxRate: 18,
            taxAmount: 6300,
            total: 41300,
          },
        ],
        subTotal: 35000,
        taxTotal: 6300,
        total: 41300,
        credit: 20000,
        discount: 0,
        paymentStatus: 'partially',
        status: 'sent',
        createdBy: admin1._id,
      });
    }

    let invoice4 = await Invoice.findOne({ createdBy: admin1._id, number: 1004 });
    if (!invoice4) {
      invoice4 = await Invoice.create({
        number: 1004,
        year: new Date().getFullYear(),
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        client: client4._id,
        items: [
          {
            itemName: product3.name,
            description: product3.description,
            quantity: 2,
            price: product3.price,
            taxRate: 18,
            taxAmount: 4500,
            total: 29500,
          },
        ],
        subTotal: 25000,
        taxTotal: 4500,
        total: 29500,
        credit: 0,
        discount: 0,
        paymentStatus: 'unpaid',
        status: 'draft',
        createdBy: admin1._id,
      });
    }

    console.log('✅ Admin 1 Invoices created (4 invoices)');

    // Sample Quotes for Admin 1
    let quote1 = await Quote.findOne({ createdBy: admin1._id, number: 1001 });
    if (!quote1) {
      quote1 = await Quote.create({
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
    }

    let quote2 = await Quote.findOne({ createdBy: admin1._id, number: 1002 });
    if (!quote2) {
      quote2 = await Quote.create({
        number: 1002,
        year: new Date().getFullYear(),
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiredDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        client: client3._id,
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
        status: 'accepted',
        createdBy: admin1._id,
      });
    }

    console.log('✅ Admin 1 Quotes created (2 quotes)');

    // Sample Payments for Admin 1
    let payment1 = await Payment.findOne({ createdBy: admin1._id, number: 1001 });
    if (!payment1 && invoice2) {
      await Payment.create({
        number: 1001,
        client: client2._id,
        invoice: invoice2._id,
        amount: 14750,
        currency: 'INR',
        paymentMode: defaultPaymentMode._id,
        ref: 'TXN-HDFC-992211',
        description: 'Full Payment received via Wire Transfer for Invoice #1002',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: admin1._id,
      });
    }

    let payment2 = await Payment.findOne({ createdBy: admin1._id, number: 1002 });
    if (!payment2 && invoice3) {
      await Payment.create({
        number: 1002,
        client: client3._id,
        invoice: invoice3._id,
        amount: 20000,
        currency: 'INR',
        paymentMode: defaultPaymentMode._id,
        ref: 'UPI-APEX-443322',
        description: 'Partial Advance Payment received via UPI for Invoice #1003',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: admin1._id,
      });
    }

    console.log('✅ Admin 1 Payments created (2 payments)');

    console.log('\n🎉 Setup & Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log('👤 Admin 1 (With Full Sample Data):');
    console.log('   Email:    admin1@billstack.com');
    console.log('   Password: admin123');
    console.log('   Includes: 4 Clients, 4 Products, 4 Invoices, 2 Quotes, 2 Payments, HDFC Bank, Terms & Conditions');
    console.log('----------------------------------------------------');
    console.log('👤 Admin 2 (Clean / Empty Slate):');
    console.log('   Email:    admin2@billstack.com');
    console.log('   Password: admin123');
    console.log('   Includes: 0 Clients, 0 Invoices (Clean testing account)');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
