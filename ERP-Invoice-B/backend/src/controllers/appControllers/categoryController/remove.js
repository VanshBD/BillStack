const mongoose = require('mongoose');
const Category = mongoose.model('Category');

/**
 * Hard delete a Category (physical removal from DB)
 * Returns 404 if not found, 200 on success
 */
const remove = async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  if (req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const result = await Category.deleteOne(query).exec();

  if (!result || result.deletedCount === 0) {
    return res.status(404).json({ success: false, result: null, message: 'Category not found' });
  }

  return res.status(200).json({ success: true, result: { _id: id }, message: 'Category permanently deleted' });
};

module.exports = remove;
