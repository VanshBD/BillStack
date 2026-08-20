const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const increaseBySettingKey = async ({ settingKey, adminId }) => {
  try {
    if (!settingKey) {
      return null;
    }

    const query = { settingKey };
    const updateData = { $inc: { settingValue: 1 } };
    if (adminId) {
      query.createdBy = adminId;
      updateData.$setOnInsert = { createdBy: adminId };
    }

    const result = await Model.findOneAndUpdate(
      query,
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).exec();

    if (!result) {
      return null;
    } else {
      return result;
    }
  } catch {
    return null;
  }
};

module.exports = increaseBySettingKey;
