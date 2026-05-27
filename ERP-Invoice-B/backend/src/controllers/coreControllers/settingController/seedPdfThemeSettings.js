const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Model = mongoose.model('Setting');

/**
 * Upserts PDF theme settings from the default JSON file.
 * Safe to call multiple times — only inserts missing keys, never overwrites existing values.
 */
const seedPdfThemeSettings = async (req, res) => {
  try {
    const filePath = path.resolve('src/setup/defaultSettings/pdfThemeSettings.json');
    const defaults = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const ops = defaults.map((setting) => ({
      updateOne: {
        filter: { settingKey: setting.settingKey },
        update: { $setOnInsert: setting },
        upsert: true,
      },
    }));

    await Model.bulkWrite(ops);

    return res.status(200).json({
      success: true,
      result: null,
      message: 'PDF theme settings seeded successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = seedPdfThemeSettings;
