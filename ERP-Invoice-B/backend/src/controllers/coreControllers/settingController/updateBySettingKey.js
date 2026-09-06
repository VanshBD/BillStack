const mongoose = require('mongoose');
const Model = mongoose.model('Setting');

const updateBySettingKey = async (req, res) => {
  const rawKey = req.params.settingKey || undefined;

  if (!rawKey) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingKey provided',
    });
  }

  const settingKey = rawKey.toLowerCase();
  const { settingValue } = req.body;

  const existingDoc = await Model.findOne({ settingKey }).exec();
  const settingCategory = existingDoc?.settingCategory || 'app_settings';

  const query = { settingKey };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const updateData = {
    settingKey,
    settingValue: settingValue !== undefined ? settingValue : null,
    settingCategory,
  };

  if (req.admin && req.admin._id) {
    updateData.createdBy = req.admin._id;
  }

  const result = await Model.findOneAndUpdate(
    query,
    { $set: updateData },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  ).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully updated document by settingKey: ' + settingKey,
  });
};

module.exports = updateBySettingKey;
