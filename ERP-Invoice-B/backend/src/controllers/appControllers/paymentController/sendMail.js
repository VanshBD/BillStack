const mongoose = require('mongoose');
const { sendPaymentReceiptEmail } = require('@/helpers/emailService');

const mail = async (req, res) => {
  try {
    const { paymentId } = req.body;

    // Validate payment ID
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid or missing payment ID',
      });
    }

    // Fetch payment with client and invoice details
    const PaymentModel = mongoose.model('Payment');
    const payment = await PaymentModel.findById(paymentId)
      .populate('client')
      .populate('invoice')
      .exec();

    if (!payment) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Payment not found',
      });
    }

    // Validate client and email
    if (!payment.client || !payment.client.email) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Client email not found for this payment',
      });
    }

    // Send email
    // Ensure PDF exists and attach it
    const pdfController = require('@/controllers/pdfController');
    const fileId = 'payment-' + payment._id + '.pdf';
    const folderPath = 'payment';
    const targetLocation = `src/public/download/${folderPath}/${fileId}`;

    await new Promise((resolve) => {
      try {
        pdfController.generatePdf('Payment', { filename: folderPath, format: 'A4', targetLocation }, payment, () => resolve());
      } catch (err) {
        console.warn('PDF generation failed for payment:', err.message);
        return resolve();
      }
    });

    const emailResult = await sendPaymentReceiptEmail({
      clientEmail: payment.client.email,
      clientName: payment.client.name || payment.client.firstName || 'Client',
      paymentAmount: payment.amount,
      paymentDate: payment.date,
      attachments: [{ path: targetLocation, filename: fileId }],
    });

    return res.status(200).json({
      success: true,
      result: emailResult,
      message: `Payment receipt sent successfully to ${payment.client.email}`,
    });
  } catch (error) {
    console.error('Payment email send error:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Failed to send payment receipt email',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

module.exports = mail;

