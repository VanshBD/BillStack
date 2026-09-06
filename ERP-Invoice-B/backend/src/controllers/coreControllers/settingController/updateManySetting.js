const mongoose = require('mongoose');
const Model = mongoose.model('Setting');

const updateManySetting = async (req, res) => {
  // req.body = { settings: [{ settingKey: "", settingValue: "" }] }
  const { settings } = req.body;

  if (!settings || !Array.isArray(settings) || settings.length === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settings provided',
    });
  }

  // Pre-fetch existing settings to inherit settingCategory if available
  const keys = settings.map((s) => s.settingKey && s.settingKey.toLowerCase()).filter(Boolean);
  const existingDocs = await Model.find({ settingKey: { $in: keys } }).exec();
  const categoryMap = new Map();
  existingDocs.forEach((doc) => {
    if (doc.settingKey && doc.settingCategory) {
      categoryMap.set(doc.settingKey.toLowerCase(), doc.settingCategory);
    }
  });

  let settingsHasError = false;
  const updateDataArray = [];

  for (const setting of settings) {
    if (!setting || !setting.settingKey) {
      settingsHasError = true;
      break;
    }

    const key = setting.settingKey.toLowerCase();
    const val = setting.settingValue !== undefined ? setting.settingValue : null;
    const category = categoryMap.get(key) || 'company_settings';

    const filter = { settingKey: key };
    if (req.admin && req.admin._id) {
      filter.createdBy = req.admin._id;
    }

    const update = {
      settingKey: key,
      settingValue: val,
      settingCategory: category,
    };

    if (req.admin && req.admin._id) {
      update.createdBy = req.admin._id;
    }

    updateDataArray.push({
      updateOne: {
        filter,
        update: { $set: update },
        upsert: true,
      },
    });
  }

  if (settingsHasError || updateDataArray.length === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'Settings provided has Error',
    });
  }

  await Model.bulkWrite(updateDataArray);

  return res.status(200).json({
    success: true,
    result: [],
    message: 'Successfully updated all settings',
  });
};

module.exports = updateManySetting;
