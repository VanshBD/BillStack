const mongoose = require('mongoose');

const Model = mongoose.model('TermsAndConditions');

const deleteTerms = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = { _id: id, removed: false };
    if (req.admin && req.admin._id) {
      query.createdBy = req.admin._id;
    }

    const existingTerms = await Model.findOne(query);
    if (!existingTerms) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Terms and conditions not found',
      });
    }

    if (existingTerms.isDefault) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Cannot delete default terms and conditions',
      });
    }

    await Model.findOneAndUpdate(
      query,
      { 
        removed: true,
        updated: new Date()
      }
    );
    
    return res.status(200).json({
      success: true,
      result: true,
      message: 'Terms and conditions deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting terms and conditions:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to delete terms and conditions',
    });
  }
};

module.exports = deleteTerms;
