const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const filter = async (req, res) => {
  try {
    const { filters, sort = {}, limit = 10, skip = 0 } = req.body;

    // Build query with filters
    let queryConditions = { removed: false };

    if (filters) {
      // Merge all filter conditions
      Object.assign(queryConditions, filters);
    }

    // Execute filtered query
    if (req.admin && req.admin._id) queryConditions.createdBy = req.admin._id;
    const results = await Model.find(queryConditions)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort)
      .populate('taxCategory')
      .populate('createdBy')
      .exec();

    return res.status(200).json({ 
      success: true, 
      result: results, 
      message: 'Products filtered successfully' 
    });
  } catch (error) {
    console.error('Error filtering products:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to filter products' 
    });
  }
};

module.exports = filter;
