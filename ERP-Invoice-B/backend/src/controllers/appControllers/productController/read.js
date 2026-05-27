const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const read = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        result: null, 
        message: 'Invalid or missing product ID' 
      });
    }

    const result = await Model.findOne({ _id: id, removed: false })
      .populate('taxCategory')
      .populate('createdBy')
      .exec();

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        result: null, 
        message: 'Product not found' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      result: result, 
      message: 'Product retrieved successfully' 
    });
  } catch (error) {
    console.error('Error reading product:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to retrieve product' 
    });
  }
};

module.exports = read;
