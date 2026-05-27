const mongoose = require('mongoose');

const Model = mongoose.model('Product');
const schema = require('./schemaValidate');

const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = (page - 1) * limit;  // Fixed pagination calculation

    // Note: Removed strict query validation to allow page/items parameters

    const { sortBy = 'created', sortValue = -1, filter, equal } = req.query;
    const search = req.query.search;
    const taxCategory = req.query.taxCategory;
    const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    // Build query conditions
    let queryConditions = { removed: false };

    // Add search filter
    if (search) {
      queryConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Add taxCategory filter
    if (taxCategory) {
      queryConditions.taxCategory = taxCategory;
    }

    // Add enabled filter
    if (enabled !== undefined) {
      queryConditions.enabled = enabled;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      queryConditions.price = {};
      if (minPrice) queryConditions.price.$gte = parseFloat(minPrice);
      if (maxPrice) queryConditions.price.$lte = parseFloat(maxPrice);
    }

    // Add equal filter
    if (equal) {
      queryConditions[equal] = equal;
    }

    // Execute query
    const resultsPromise = Model.find(queryConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortValue })
      .populate('taxCategory')
      .populate('createdBy')
      .exec();

    // Count total documents
    const countPromise = Model.countDocuments(queryConditions);

    // Resolve both promises
    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    // Calculate total pages
    const pages = Math.ceil(count / limit);

    // Build pagination object
    const pagination = {
      page,
      limit,
      totalPages: pages,
      totalDocs: count,
      pagingCounter: skip + 1,
      hasPrev: page > 1,
      hasNext: page < pages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < pages ? page + 1 : null
    };

    return res.status(200).json({
      success: true,
      result: {
        docs: result,
        ...pagination
      },
      message: 'Products retrieved successfully',
    });
  } catch (error) {
    console.error('Error listing products:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to retrieve products',
    });
  }
};

module.exports = list;
