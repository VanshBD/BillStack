const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const readBySettingKey = async (req, res) => {
  // Find document by id
  const settingKey = req.params.settingKey || undefined;

  if (!settingKey) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingKey provided ',
    });
  }

  const query = { settingKey };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  let result = await Model.findOne(query);

  // Fallback to global setting if no company-specific setting exists
  if (!result && query.createdBy) {
    result = await Model.findOne({ settingKey, createdBy: { $exists: false } });
  }

  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found by this settingKey: ' + settingKey,
    });
  } else {
    // Return success resposne
    return res.status(200).json({
      success: true,
      result,
      message: 'we found this document by this settingKey: ' + settingKey,
    });
  }
};

module.exports = readBySettingKey;
