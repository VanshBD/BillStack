/**
 * Unified Email Service
 * Handles all email sending for the application
 * Supports multiple email providers (Resend, nodemailer fallback)
 */

const config = require('@/config');
const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const { passwordVerfication } = require('@/emailTemplate/emailVerfication');
const { SendInvoice, SendQuote, SendOffer, SendPaymentReceipt } = require('@/emailTemplate/SendEmailTemplate');

/**
 * Send email using configured provider
 * @param {Object} emailData - Email configuration
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML email content
 * @param {string} emailData.from - Sender email (defaults to config.appEmail)
 * @returns {Promise<Object>} - Email send result
 */
const fs = require('fs');
const path = require('path');

const sendEmail = async ({ to, subject, html, from = config.appEmail, attachments = [] }) => {
  try {
    // Validate required parameters
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters: to, subject, html');
    }

    if (!from) {
      throw new Error('No sender email configured. Set BILLSTACK_APP_EMAIL in .env');
    }

    // Normalize attachments into nodemailer format
    const normalizedAttachments = [];
    for (const att of attachments) {
      if (!att) continue;
      // att can be { path } or { filename, path } or { content }
      if (att.path) {
        // ensure file exists
        const absPath = path.isAbsolute(att.path) ? att.path : path.join(process.cwd(), att.path);
        if (fs.existsSync(absPath)) {
          normalizedAttachments.push({ filename: att.filename || path.basename(absPath), path: absPath });
        }
      } else if (att.content) {
        normalizedAttachments.push({ filename: att.filename || `attachment-${Date.now()}`, content: att.content });
      }
    }

    // Prefer SMTP if configured
    if (config.smtp && config.smtp.host && config.smtp.user && config.smtp.pass) {
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: !!config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        attachments: normalizedAttachments,
      });
      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
        to,
        subject,
      };
    }

    // Fallback to Resend if SMTP not configured
    if (config.resendApi) {
      const resend = new Resend(config.resendApi);

      // Resend attachments must be base64 encoded
      const resendAttachments = [];
      for (const att of normalizedAttachments) {
        try {
          const filePath = att.path;
          if (filePath && fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            resendAttachments.push({
              name: att.filename,
              data: fileBuffer.toString('base64'),
              type: 'application/pdf',
            });
          } else if (att.content) {
            const buf = Buffer.from(att.content);
            resendAttachments.push({ name: att.filename, data: buf.toString('base64'), type: 'application/octet-stream' });
          }
        } catch (err) {
          // continue without a particular attachment
          console.warn('Failed to read attachment for resend:', err.message);
        }
      }

      const payload = {
        from,
        to,
        subject,
        html,
      };
      if (resendAttachments.length) payload['attachments'] = resendAttachments;

      const { data, error } = await resend.emails.send(payload);

      if (error) {
        console.error('Resend email error:', error);
        throw new Error(`Failed to send email via Resend: ${error.message}`);
      }

      return {
        success: true,
        provider: 'resend',
        messageId: data?.id,
        to,
        subject,
      };
    }

    // Fallback: log email or use alternative provider
    console.warn(`⚠️  No email provider configured. Email would be sent to: ${to}`);
    console.warn(`   Subject: ${subject}`);
    console.warn('   In production, configure SMTP or RESEND_API in .env for actual email sending.');
    
    return {
      success: true,
      provider: 'fallback',
      messageId: `fallback-${Date.now()}`,
      to,
      subject,
      warning: 'Email logged to console only. Configure SMTP or RESEND_API for production sending.',
    };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ email, name, link }) => {
  return sendEmail({
    to: email,
    subject: 'Reset your Password | BillStack',
    html: passwordVerfication({ name, link }),
  });
};

/**
 * Send invoice email to client
 */
const sendInvoiceEmail = async ({ clientEmail, clientName, invoiceNumber, invoiceId, attachments = [] }) => {
  const html = SendInvoice({
    title: `Invoice #${invoiceNumber} from BillStack`,
    name: clientName,
    time: new Date().toLocaleDateString(),
  });

  return sendEmail({
    to: clientEmail,
    subject: `Your Invoice #${invoiceNumber} from BillStack`,
    html,
    attachments,
  });
};

/**
 * Send quote email to client
 */
const sendQuoteEmail = async ({ clientEmail, clientName, quoteNumber, quoteId, attachments = [] }) => {
  const html = SendQuote({
    title: `Quote #${quoteNumber} from BillStack`,
    name: clientName,
    time: new Date().toLocaleDateString(),
  });

  return sendEmail({
    to: clientEmail,
    subject: `Your Quote #${quoteNumber} from BillStack`,
    html,
    attachments,
  });
};

/**
 * Send payment receipt email to client
 */
const sendPaymentReceiptEmail = async ({ clientEmail, clientName, paymentAmount, paymentDate, attachments = [] }) => {
  const html = SendPaymentReceipt({
    title: `Payment Receipt from BillStack`,
    name: clientName,
    time: new Date().toLocaleDateString(),
  });

  return sendEmail({
    to: clientEmail,
    subject: `Your Payment Receipt from BillStack`,
    html,
    attachments,
  });
};

/**
 * Send offer email to client
 */
const sendOfferEmail = async ({ clientEmail, clientName, offerNumber, offerData }) => {
  const html = SendOffer({
    title: `Offer #${offerNumber} from BillStack`,
    name: clientName,
    time: new Date().toLocaleDateString(),
  });

  return sendEmail({
    to: clientEmail,
    subject: `Your Offer #${offerNumber} from BillStack`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
  sendQuoteEmail,
  sendPaymentReceiptEmail,
  sendOfferEmail,
};
