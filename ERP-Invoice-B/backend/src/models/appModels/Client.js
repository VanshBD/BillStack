const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  gstNumber: String,
  gst: String,
  country: String,
  address: String,
  state: String,
  stateCode: String,
  billingAddress: String,
  shippingAddress: String,
  isShippingSameAsBilling: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Client', schema);
