const mongoose = require('mongoose');
const Model = mongoose.model('PaymentMode');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const schema = require('./schemaValidate');
const methods = createCRUDController('PaymentMode');

delete methods['delete'];

methods.create = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, result: null, message: error.details[0]?.message });
  }
  req.body = value;
  const { isDefault } = req.body;

  if (isDefault) {
    await Model.updateMany({ ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) }, { isDefault: false });
  }

  // check duplicate name
  const existing = await Model.findOne({ name: req.body.name, removed: false, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) });
  if (existing) {
    return res.status(400).json({ success: false, result: null, message: 'Payment mode name already exists' });
  }

  const countDefault = await Model.countDocuments({
    isDefault: true,
    ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {})
  });

  const result = await new Model({
    ...req.body,
    createdBy: req.admin && req.admin._id ? req.admin._id : null,
    isDefault: countDefault < 1 ? true : false,
  }).save();

  return res.status(200).json({
    success: true,
    result: result,
    message: 'payment mode created successfully',
  });
};

methods.delete = async (req, res) => {
  return res.status(403).json({
    success: false,
    result: null,
    message: "you can't delete payment mode after it has been created",
  });
};

methods.update = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, result: null, message: error.details[0]?.message });
  }
  req.body = value;
  const { id } = req.params;
  const paymentMode = await Model.findOne({
    _id: req.params.id,
    removed: false,
    ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {})
  }).exec();
  const { isDefault = paymentMode.isDefault, enabled = paymentMode.enabled } = req.body;

  // if isDefault:false , we update first - isDefault:true
  // if enabled:false and isDefault:true , we update first - isDefault:true
  if (!isDefault || (!enabled && isDefault)) {
    await Model.findOneAndUpdate({ _id: { $ne: id }, enabled: true, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) }, { isDefault: true });
  }

  // if isDefault:true and enabled:true, we update other paymentMode and make is isDefault:false
  if (isDefault && enabled) {
    await Model.updateMany({ _id: { $ne: id }, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) }, { isDefault: false });
  }

  const paymentModeCount = await Model.countDocuments({ ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) });

  // if enabled:false and it's only one exist, we can't disable
  if ((!enabled || !isDefault) && paymentModeCount <= 1) {
    return res.status(422).json({
      success: false,
      result: null,
      message: 'You cannot disable the paymentMode because it is the only existing one',
    });
  }

  const result = await Model.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    message: 'paymentMode updated successfully',
    result,
  });
};

module.exports = methods;
