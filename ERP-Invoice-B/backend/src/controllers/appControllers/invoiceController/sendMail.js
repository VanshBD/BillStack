const mongoose = require('mongoose');
const { sendInvoiceEmail } = require('@/helpers/emailService');

const mail = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    // Validate invoice ID
    if (!invoiceId || !mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid or missing invoice ID',
      });
    }

    // Fetch invoice with client details
    const InvoiceModel = mongoose.model('Invoice');
    const invoice = await InvoiceModel.findById(invoiceId).populate('client').exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Invoice not found',
      });
    }

    // Validate client and email
    if (!invoice.client || !invoice.client.email) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Client email not found for this invoice',
      });
    }

    // Send email
    // Ensure PDF exists (generate a fresh copy) and attach it
    const pdfController = require('@/controllers/pdfController');
    const fileId = 'invoice-' + invoice._id + '.pdf';
    const folderPath = 'invoice';
    const targetLocation = `src/public/download/${folderPath}/${fileId}`;

    await new Promise((resolve, reject) => {
      try {
        pdfController.generatePdf(
          'Invoice',
          { filename: folderPath, format: 'A4', targetLocation },
          invoice,
          () => resolve()
        );
      } catch (err) {
        // if generation throws, continue without attachment
        console.warn('PDF generation failed for invoice:', err.message);
        return resolve();
      }
    });

    const emailResult = await sendInvoiceEmail({
      clientEmail: invoice.client.email,
      clientName: invoice.client.name || invoice.client.firstName || 'Client',
      invoiceNumber: invoice.number,
      invoiceId: invoice._id,
      attachments: [{ path: targetLocation, filename: fileId }],
    });

    return res.status(200).json({
      success: true,
      result: emailResult,
      message: `Invoice #${invoice.number} sent successfully to ${invoice.client.email}`,
    });
  } catch (error) {
    console.error('Invoice email send error:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to send invoice email',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

module.exports = mail;

