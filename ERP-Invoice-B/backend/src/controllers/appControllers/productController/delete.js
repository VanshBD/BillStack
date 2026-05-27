const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        result: null, 
        message: 'Invalid or missing product ID' 
      });
    }

    // Check if product exists
    const existingProduct = await Model.findOne({ _id: id, removed: false });
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        result: null, 
        message: 'Product not found' 
      });
    }

    // Soft delete - set removed to true
    const result = await Model.findOneAndUpdate(
      { _id: id }, 
      { removed: true, updated: new Date() }, 
      { new: true }
    ).exec();

    return res.status(200).json({ 
      success: true, 
      result: result, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to delete product' 
    });
  }
};

module.exports = remove;
