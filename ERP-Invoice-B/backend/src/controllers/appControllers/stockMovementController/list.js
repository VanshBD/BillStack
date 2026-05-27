const mongoose = require('mongoose');

/**
 * Custom list implementation for stock movements to ensure prev/new quantities
 */
const list = async (req, res) => {
  try {
    const StockMovement = mongoose.model('StockMovement');
    const sort = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const query = { };

    // default filter: not removed (StockMovement has no removed flag but keep flexible)
    const total = await StockMovement.countDocuments(query).exec();
    const docs = await StockMovement.find(query)
      .sort({ created: sort })
      .skip(skip)
      .limit(limit)
      .populate(['product', 'createdBy'])
      .exec();

    return res.status(200).json({
      success: true,
      result: {
        data: docs,
        total,
        page,
        limit,
      },
      message: 'Successfully fetched stock movements',
    });
  } catch (error) {
    console.error('StockMovement list error:', error);
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = { list };
