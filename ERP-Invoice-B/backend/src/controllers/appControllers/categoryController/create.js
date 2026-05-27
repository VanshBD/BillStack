const mongoose = require('mongoose');
const Model = mongoose.model('Category');

const { createSchema } = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body || {};

  const { error, value } = createSchema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  // default flags
  value.removed = false;
  if (req.admin && req.admin._id) {
    value.createdBy = req.admin._id;
  }

  const result = await new Model(value).save();

  return res.status(200).json({
    success: true,
    result,
    message: 'Category created successfully',
  });
};

module.exports = create;
