const mongoose = require('mongoose');

const read = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, result: null, message: 'Invalid or missing id' });
    }

    const StockMovement = mongoose.model('StockMovement');
    const movement = await StockMovement.findById(id).populate(['product', 'createdBy']).exec();

    if (!movement) {
      return res.status(404).json({ success: false, result: null, message: 'Stock movement not found' });
    }

    return res.status(200).json({ success: true, result: movement, message: 'Successfully fetched stock movement' });
  } catch (error) {
    console.error('StockMovement read error:', error);
    return res.status(500).json({ success: false, result: null, message: error.message });
  }
};

module.exports = read;
