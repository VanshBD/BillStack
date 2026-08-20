const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const readBySettingKey = async ({ settingKey, adminId }) => {
  try {
    if (!settingKey) {
      return null;
    }

    const query = { settingKey };
    if (adminId) {
      query.createdBy = adminId;
    }

    let result = await Model.findOne(query);
    if (!result && adminId) {
      result = await Model.findOne({ settingKey, createdBy: { $exists: false } });
    }

    if (!result) {
      return null;
    } else {
      return result;
    }
  } catch {
    return null;
  }
};

module.exports = readBySettingKey;
