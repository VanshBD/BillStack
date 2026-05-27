const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  sku: {
    type: String,
  },
  description: {
    type: String,
  },
  taxCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taxes',
    required: true,
    autopopulate: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
  },
  // HSN code for tax purposes
  hsnCode: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    default: 'PCS',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  files: [
    {
      id: String,
      name: String,
      path: String,
      description: String,
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

// Unique SKU if provided (case-insensitive)
productSchema.index({ sku: 1 }, { unique: true, sparse: true, collation: { locale: 'en', strength: 2 } });

// Pre-save hook to generate SKU automatically
productSchema.pre('save', async function (next) {
  // Only generate SKU if it's not provided
  if (!this.sku || this.sku.trim() === '') {
    // Generate SKU based on product name
    const name = this.name || '';
    const nameWithoutSpaces = name.replace(/\s+/g, '');
    const nameWithoutSpecialChars = nameWithoutSpaces.replace(/[^a-zA-Z0-9]/g, '');

    // Take first 6 characters of name (uppercase) + random 4 digits
    const namePrefix = nameWithoutSpecialChars.substring(0, 6).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    this.sku = `${namePrefix}-${randomSuffix}`;
  }

  next();
});

productSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Product', productSchema);
