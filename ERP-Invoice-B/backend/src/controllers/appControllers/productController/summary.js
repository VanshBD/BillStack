const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const summary = async (req, res) => {
  try {
    const { group, match = {}, aggregate = [] } = req.body;

    // Build match conditions
    const matchConditions = { removed: false, ...match };

    // Default aggregation if no group specified
    if (!group || Object.keys(aggregate).length === 0) {
      aggregate.push(
        { $count: 'totalProducts' },
        { $sum: '$price', alias: 'totalValue' },
        { $avg: '$price', alias: 'averagePrice' },
        { $sum: '$quantity', alias: 'totalStock' }
      );
    }

    // Add group stage if specified
    const pipeline = [
      { $match: matchConditions }
    ];

    if (group) {
      pipeline.push({ $group: { _id: `$${group}`, ...aggregate } });
    }

    // Add final projection
    pipeline.push({
      $project: {
        _id: 1,
        totalProducts: 1,
        totalValue: 1,
        averagePrice: 1,
        totalStock: 1
      }
    });

    const results = await Model.aggregate(pipeline);

    return res.status(200).json({ 
      success: true, 
      result: results, 
      message: 'Product summary retrieved successfully' 
    });
  } catch (error) {
    console.error('Error getting product summary:', error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message || 'Failed to get product summary' 
    });
  }
};

module.exports = summary;
