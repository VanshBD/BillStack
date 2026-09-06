const mongoose = require('mongoose');
const Model = mongoose.model('Setting');

const listAll = async (req, res) => {
  const query = {
    removed: false,
    isPrivate: false,
  };

  if (req.admin && req.admin._id) {
    query.$or = [{ createdBy: req.admin._id }, { createdBy: { $exists: false } }];
  }

  // Query the database for a list of all settings
  const allSettings = await Model.find(query).sort({ created: -1 }).exec();

  // Deduplicate settings by settingKey: user-specific settings take precedence over global defaults
  const settingsMap = new Map();

  for (const setting of allSettings) {
    if (!setting.settingKey) continue;
    const key = setting.settingKey.toLowerCase();
    const existing = settingsMap.get(key);

    // If no entry exists yet, or if current doc belongs to this specific admin, set it
    if (!existing || (setting.createdBy && req.admin && setting.createdBy.toString() === req.admin._id.toString())) {
      settingsMap.set(key, setting);
    }
  }

  const result = Array.from(settingsMap.values());

  if (result.length > 0) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = listAll;
