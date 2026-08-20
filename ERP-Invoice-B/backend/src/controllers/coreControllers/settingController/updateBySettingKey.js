const mongoose = require('mongoose');

const Model = mongoose.model('Setting');

const updateBySettingKey = async (req, res) => {
  const settingKey = req.params.settingKey || undefined;

  if (!settingKey) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingKey provided ',
    });
  }
  const { settingValue } = req.body;

  if (!settingValue) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingValue provided ',
    });
  }
  const query = { settingKey };
  const updateData = { settingValue };

  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
    updateData.createdBy = req.admin._id;
  }

  const result = await Model.findOneAndUpdate(
    query,
    { $set: updateData },
    {
      new: true, // return the new result instead of the old one
      upsert: true,
      runValidators: true,
    }
  ).exec();
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found by this settingKey: ' + settingKey,
    });
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document by this settingKey: ' + settingKey,
    });
  }
};

module.exports = updateBySettingKey;
