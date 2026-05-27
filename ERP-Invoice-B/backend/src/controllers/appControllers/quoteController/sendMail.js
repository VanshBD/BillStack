const mongoose = require('mongoose');
const { sendQuoteEmail } = require('@/helpers/emailService');

const mail = async (req, res) => {
  try {
    const { quoteId } = req.body;

    // Validate quote ID
    if (!quoteId || !mongoose.Types.ObjectId.isValid(quoteId)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid or missing quote ID',
      });
    }

    // Fetch quote with client details
    const QuoteModel = mongoose.model('Quote');
    const quote = await QuoteModel.findById(quoteId).populate('client').exec();

    if (!quote) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Quote not found',
      });
    }

    // Validate client and email
    if (!quote.client || !quote.client.email) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Client email not found for this quote',
      });
    }

    // Send email
    // Ensure PDF exists and attach it
    const pdfController = require('@/controllers/pdfController');
    const fileId = 'quote-' + quote._id + '.pdf';
    const folderPath = 'quote';
    const targetLocation = `src/public/download/${folderPath}/${fileId}`;

    await new Promise((resolve) => {
      try {
        pdfController.generatePdf('Quote', { filename: folderPath, format: 'A4', targetLocation }, quote, () => resolve());
      } catch (err) {
        console.warn('PDF generation failed for quote:', err.message);
        return resolve();
      }
    });

    const emailResult = await sendQuoteEmail({
      clientEmail: quote.client.email,
      clientName: quote.client.name || quote.client.firstName || 'Client',
      quoteNumber: quote.number,
      quoteId: quote._id,
      attachments: [{ path: targetLocation, filename: fileId }],
    });

    return res.status(200).json({
      success: true,
      result: emailResult,
      message: `Quote #${quote.number} sent successfully to ${quote.client.email}`,
    });
  } catch (error) {
    console.error('Quote email send error:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to send quote email',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

module.exports = mail;

