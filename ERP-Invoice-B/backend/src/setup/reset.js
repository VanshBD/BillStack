const config = require('../config');
const mongoose = require('mongoose');

async function connectDB() {
  const uris = [
    config.database,
    'mongodb://127.0.0.1:27017/billstack-db',
    'mongodb://127.0.0.1:27017/idurar-db'
  ];
  for (const uri of uris) {
    if (!uri) continue;
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`Connected to database: ${mongoose.connection.name}`);
      return;
    } catch (e) {
      // try next
    }
  }
}

async function deleteData() {
  await connectDB();
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const Setting = require('../models/coreModels/Setting');
    const Upload = require('../models/coreModels/Upload');
    const PaymentMode = require('../models/appModels/PaymentMode');
    const Taxes = require('../models/appModels/Taxes');
    const Invoice = require('../models/appModels/Invoice');
    const Quote = require('../models/appModels/Quote');
    const Payment = require('../models/appModels/Payment');
    const Client = require('../models/appModels/Client');
    const Product = require('../models/appModels/Product');
    const BankAccount = require('../models/appModels/BankAccount');
    const Category = require('../models/appModels/Category');
    const StockMovement = require('../models/appModels/StockMovement');
    const TermsAndConditions = require('../models/appModels/TermsAndConditions');

    await Admin.deleteMany();
    await AdminPassword.deleteMany();
    await Setting.deleteMany();
    await Upload.deleteMany();
    await PaymentMode.deleteMany();
    await Taxes.deleteMany();
    await Invoice.deleteMany();
    await Quote.deleteMany();
    await Payment.deleteMany();
    await Client.deleteMany();
    await Product.deleteMany();
    await BankAccount.deleteMany();
    await Category.deleteMany();
    await StockMovement.deleteMany();
    await TermsAndConditions.deleteMany();

    console.log('✅ ALL DATABASE DATA HAS BEEN COMPLETELY WIPED AND RESET!');
    console.log('💡 To populate initial default settings/admin, run: npm run setup');
    process.exit(0);
  } catch (err) {
    console.error('🚫 Error wiping database data:', err.message);
    process.exit(1);
  }
}

deleteData();
