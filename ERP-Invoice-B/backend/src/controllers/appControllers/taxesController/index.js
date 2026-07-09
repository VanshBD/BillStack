const mongoose = require('mongoose');
const Model = mongoose.model('Taxes');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const schema = require('./schemaValidate');
const methods = createCRUDController('Taxes');

delete methods['delete'];

methods.create = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, result: null, message: error.details[0]?.message });
  }
  req.body = value;

  // Enforce that disabled taxes cannot be set as default
  if (req.body.enabled === false) {
    req.body.isDefault = false;
  }

  if (req.body.isDefault) {
    req.body.enabled = true;
    await Model.updateMany({ ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) }, { isDefault: false });
  } else {
    // If no default active taxes, make this default if enabled
    const activeDefaultCount = await Model.countDocuments({
      removed: false,
      isDefault: true,
      enabled: true,
      ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {})
    });
    if (activeDefaultCount === 0 && req.body.enabled !== false) {
      req.body.isDefault = true;
    }
  }

  // duplicate name
  const existing = await Model.findOne({ taxName: req.body.taxName, removed: false, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) });
  if (existing) {
    return res.status(400).json({ success: false, result: null, message: 'Tax name already exists' });
  }

  if (req.admin && req.admin._id) {
    req.body.createdBy = req.admin._id;
  }
  const result = await new Model(req.body).save();

  return res.status(200).json({
    success: true,
    result: result,
    message: 'Tax created successfully',
  });
};

methods.delete = async (req, res) => {
  return res.status(403).json({
    success: false,
    result: null,
    message: "you can't delete tax after it has been created",
  });
};

methods.update = async (req, res) => {
  const { error, value } = schema.fork(Object.keys(schema.describe().keys), (s) => s.optional()).validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, result: null, message: error.details[0]?.message });
  }
  req.body = value;
  const { id } = req.params;

  // duplicate name check (excluding current record)
  const dup = await Model.findOne({ taxName: req.body.taxName, removed: false, _id: { $ne: id }, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) });
  if (dup) {
    return res.status(400).json({ success: false, result: null, message: 'Tax name already exists' });
  }

  const tax = await Model.findOne({
    _id: id,
    removed: false,
  }).exec();

  if (!tax) {
    return res.status(404).json({ success: false, result: null, message: 'Tax not found' });
  }

  // Support partial or complete updates safely
  const isDefault = req.body.isDefault !== undefined ? req.body.isDefault : tax.isDefault;
  const enabled = req.body.enabled !== undefined ? req.body.enabled : tax.enabled;

  req.body.isDefault = isDefault;
  req.body.enabled = enabled;

  // Force isDefault to false if tax is disabled
  if (req.body.enabled === false) {
    req.body.isDefault = false;
  }

  const lostDefaultStatus =
    (tax.isDefault && req.body.isDefault === false) ||
    (tax.isDefault && req.body.enabled === false);

  if (lostDefaultStatus) {
    const nextDefault = await Model.findOne({
      _id: { $ne: id },
      removed: false,
      enabled: true,
      ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {})
    }).sort({ created: -1 });
    if (nextDefault) {
      await Model.updateOne({ _id: nextDefault._id }, { isDefault: true });
    }
  }

  // Enforce isDefault logic
  if (req.body.isDefault && req.body.enabled !== false) {
    req.body.enabled = true;
    await Model.updateMany({ _id: { $ne: id }, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) }, { isDefault: false });
  }

  const taxesCount = await Model.countDocuments({ removed: false, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) });

  // if enabled:false and it's only one exist, we can't disable
  if (req.body.enabled === false && taxesCount <= 1) {
    return res.status(422).json({
      success: false,
      result: null,
      message: 'You cannot disable the tax because it is the only existing one',
    });
  }

  const result = await Model.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Tax updated successfully',
    result,
  });
};

module.exports = methods;
