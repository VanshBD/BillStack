const custom = require('@/controllers/pdfController');
const mongoose = require('mongoose');

module.exports = downloadPdf = async (req, res, { directory, id }) => {
  try {
    const modelName = directory.slice(0, 1).toUpperCase() + directory.slice(1);

    if (!mongoose.models[modelName]) {
      return res.status(404).json({
        success: false,
        result: null,
        message: `Model '${modelName}' does not exist`,
      });
    }

    const Model = mongoose.model(modelName);
    const result = await Model.findOne({ _id: id }).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Document not found',
      });
    }

    const fileId = result.pdf || modelName.toLowerCase() + '-' + result._id + '.pdf';
    const folderPath = modelName.toLowerCase();
    const targetLocation = `src/public/download/${folderPath}/${fileId}`;

    // Wait for PDF to be fully written before sending
    await custom.generatePdf(
      modelName,
      { filename: folderPath, format: 'A4', targetLocation },
      result
    );

    return res.download(targetLocation, fileId, (error) => {
      if (error && !res.headersSent) {
        return res.status(500).json({
          success: false,
          result: null,
          message: "Couldn't send file",
          error: error.message,
        });
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Required fields are not supplied',
        error: error.message,
      });
    } else if (error.name === 'BSONTypeError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid ID',
        error: error.message,
      });
    } else {
      console.error('[downloadPdf] Error:', error);
      return res.status(500).json({
        success: false,
        result: null,
        message: error.message,
        error: error.message,
      });
    }
  }
};
