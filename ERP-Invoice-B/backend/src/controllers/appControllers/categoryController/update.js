const mongoose = require('mongoose');
const Model = mongoose.model('Category');

const { updateSchema } = require('./schemaValidate');

const update = async (req, res) => {
  const body = req.body || {};
  const { error, value } = updateSchema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const id = req.params.id;
  const updated = await Model.findOneAndUpdate({ _id: id }, { $set: value }, { new: true }).exec();
  if (!updated) {
    return res.status(404).json({ success: false, result: null, message: 'Category not found' });
  }

  return res.status(200).json({ success: true, result: updated, message: 'Category updated successfully' });
};

module.exports = update;
