const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const listAllSettings = async (adminId) => {
  try {
    const query = { removed: false };
    if (adminId) {
      query.$or = [{ createdBy: adminId }, { createdBy: { $exists: false } }];
    }

    const result = await Model.find(query).exec();

    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

module.exports = listAllSettings;
