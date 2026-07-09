const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const listAll = async (req, res) => {
  try {
    const results = await Model.find({ removed: false, ...(req.admin && req.admin._id ? { createdBy: req.admin._id } : {}) })
      .sort({ created: -1 })
      .populate('taxCategory')
      .populate('createdBy')
      .exec();

    return res.status(200).json({ 
      success: true, 
      result: results, 
      message: 'All products retrieved successfully' 
    });
  } catch (error) {
    console.error('Error listing all products:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to retrieve all products' 
    });
  }
};

module.exports = listAll;
