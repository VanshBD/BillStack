const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  branchName: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Admin'
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

bankAccountSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('BankAccount', bankAccountSchema);
