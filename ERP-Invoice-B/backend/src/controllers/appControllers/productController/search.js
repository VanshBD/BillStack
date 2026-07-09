const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const search = async (req, res) => {
  try {
    const { search, fields, taxCategory, minPrice, maxPrice, enabled, limit = 10 } = req.body;

    // Build search conditions
    let queryConditions = { removed: false };

    // Add text search
    if (search && fields) {
      const searchFields = Array.isArray(fields) ? fields : ['name', 'description', 'sku'];
      queryConditions.$or = searchFields.map(field => ({
        [field]: { $regex: search, $options: 'i' }
      }));
    }

    // Add taxCategory filter
    if (taxCategory) {
      queryConditions.taxCategory = taxCategory;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      queryConditions.price = {};
      if (minPrice) queryConditions.price.$gte = parseFloat(minPrice);
      if (maxPrice) queryConditions.price.$lte = parseFloat(maxPrice);
    }

    // Add enabled filter
    if (enabled !== undefined) {
      queryConditions.enabled = enabled;
    }

    // Execute search
    if (req.admin && req.admin._id) queryConditions.createdBy = req.admin._id;
    const results = await Model.find(queryConditions)
      .limit(parseInt(limit))
      .sort({ created: -1 })
      .populate('taxCategory')
      .populate('createdBy')
      .exec();

    return res.status(200).json({ 
      success: true, 
      result: results, 
      message: 'Products found successfully' 
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to search products' 
    });
  }
};

module.exports = search;
