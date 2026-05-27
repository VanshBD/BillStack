# Email Configuration & Implementation Guide

## Overview
This document explains how the email functionality works in the Billstack ERP/CRM backend and how to configure it properly.

## Email Sending Architecture

The email system is built with the following components:

### 1. **Email Service** (`src/helpers/emailService.js`)
Central service that handles all email sending across the application. Supports:
- **Resend API** (primary provider)
- **Fallback mode** (logs to console when Resend API is not configured)

### 2. **Email Templates** (`src/emailTemplate/`)
- `SendEmailTemplate.js` - Templates for invoice, quote, offer, and payment receipt emails
- `emailVerfication.js` - Template for password reset emails

### 3. **Controllers with Email Support**
- **Invoice** (`src/controllers/appControllers/invoiceController/sendMail.js`)
  - Endpoint: `POST /api/invoice/mail`
  - Sends invoice to client email
  
- **Quote** (`src/controllers/appControllers/quoteController/sendMail.js`)
  - Endpoint: `POST /api/quote/mail`
  - Sends quote to client email
  
- **Payment** (`src/controllers/appControllers/paymentController/sendMail.js`)
  - Endpoint: `POST /api/payment/mail`
  - Sends payment receipt to client email

### 4. **Configuration** (`src/config/index.js`)
Loads and validates environment variables required for email functionality.

---

## Environment Setup

### Required Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration
RESEND_API=re_your_resend_api_key_here
BILLSTACK_APP_EMAIL=noreply@yourdomain.com
```

### Variable Descriptions

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API` | No | (none) | API key from [Resend.com](https://resend.com). If not set, emails are logged to console. |
| `BILLSTACK_APP_EMAIL` | No | `noreply@billstack.app` | Sender email address for all outgoing emails. Must be a valid email. |
| `PUBLIC_SERVER_FILE` | No | `http://localhost:8888/` | Base URL for building absolute links in emails |
| `RESEND_API` | No | (none) | Resend API key for email delivery |

### Example `.env` File

```env
# Core Configuration
NODE_ENV=development
DATABASE=mongodb://localhost:27017/billstack-db
PORT=8888
JWT_SECRET=your-super-secret-jwt-key-change-this
OPENAI_API_KEY=sk-your-openai-key

# Server URLs
PUBLIC_SERVER_FILE=http://localhost:8888/

# Email Configuration
RESEND_API=re_1234567890abcdef
BILLSTACK_APP_EMAIL=invoices@mycompany.com

# Storage (Optional)
DO_SPACES_SECRET=
DO_SPACES_KEY=
DO_SPACES_URL=
DO_SPACES_NAME=
REGION=
```

---

## Setting Up Resend API

### Step 1: Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get API Key
1. Navigate to **Integrations & API** → **API Keys**
2. Click **Generate API Key**
3. Copy the key starting with `re_`

### Step 3: Configure Domain (Optional but Recommended)
1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `mail.mycompany.com`)
3. Verify DNS records
4. Once verified, use email addresses from your domain as `BILLSTACK_APP_EMAIL`

### Step 4: Update `.env`
```env
RESEND_API=re_your_key_here
BILLSTACK_APP_EMAIL=noreply@yourdomain.com
```

---

## API Endpoints

### Send Invoice Email
**Request:**
```bash
POST /api/invoice/mail
Content-Type: application/json

{
  "invoiceId": "665d1f2a8c1b2e3f4g5h6i7j"
}
```

**Response (Success):**
```json
{
  "success": true,
  "result": {
    "success": true,
    "provider": "resend",
    "messageId": "email_id_from_resend",
    "to": "client@example.com",
    "subject": "Your Invoice #123 from Billstack"
  },
  "message": "Invoice #123 sent successfully to client@example.com"
}
```

### Send Quote Email
**Request:**
```bash
POST /api/quote/mail
Content-Type: application/json

{
  "quoteId": "665d1f2a8c1b2e3f4g5h6i7j"
}
```

**Response:** Similar to invoice email

### Send Payment Receipt Email
**Request:**
```bash
POST /api/payment/mail
Content-Type: application/json

{
  "paymentId": "665d1f2a8c1b2e3f4g5h6i7j"
}
```

**Response:** Similar to invoice email

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid or missing invoice/quote/payment ID` | ID parameter missing or invalid | Provide a valid MongoDB ObjectId |
| `Client email not found` | Client record has no email | Update client record with valid email |
| `No sender email configured` | `BILLSTACK_APP_EMAIL` not set | Add `BILLSTACK_APP_EMAIL` to `.env` |
| `Failed to send email via Resend` | Invalid Resend API key | Verify `RESEND_API` in `.env` |
| `RESEND_API not configured` | API key not set (development mode) | Emails logged to console only |

### Development Mode
When `RESEND_API` is not configured:
- Emails are logged to the server console
- A fallback response is returned indicating "Email logged to console only"
- No actual emails are sent
- Perfect for local development and testing

---

## Code Examples

### Using the Email Service Directly

```javascript
const { sendInvoiceEmail } = require('@/helpers/emailService');

// Send invoice email
const result = await sendInvoiceEmail({
  clientEmail: 'client@example.com',
  clientName: 'John Doe',
  invoiceNumber: 123,
  invoiceId: 'mongoid_here',
});

console.log(result);
// Output:
// {
//   success: true,
//   provider: 'resend',
//   messageId: 'email_id',
//   to: 'client@example.com',
//   subject: 'Your Invoice #123 from Billstack'
// }
```

### All Available Email Functions

```javascript
const {
  sendEmail,                    // Generic send email
  sendPasswordResetEmail,      // Password reset
  sendInvoiceEmail,           // Invoice notification
  sendQuoteEmail,             // Quote notification
  sendPaymentReceiptEmail,    // Payment receipt
  sendOfferEmail,             // Offer notification
} = require('@/helpers/emailService');
```

---

## Testing Email Functionality

### 1. Verify Configuration
```bash
# Check if environment variables are loaded
curl http://localhost:8888/api/setting/list
# Look for email-related settings
```

### 2. Test Invoice Email
```bash
curl -X POST http://localhost:8888/api/invoice/mail \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "invoiceId": "YOUR_INVOICE_ID"
  }'
```

### 3. Monitor Logs
```bash
# Watch server logs for email activity
npm run dev
# Look for messages like:
# ✅ Email sent to client@example.com
# or
# ⚠️  RESEND_API not configured. Email would be sent to: ...
```

### 4. Check Resend Dashboard
1. Go to https://resend.com/dashboard
2. Navigate to **Emails** tab
3. View sent emails, delivery status, and bounces

---

## Best Practices

### 1. **Always Verify Client Email**
Before sending any email:
```javascript
if (!client.email || !client.email.includes('@')) {
  throw new Error('Invalid client email');
}
```

### 2. **Use Environment Variables**
Never hardcode email addresses or API keys:
```javascript
// ✅ Good
const sender = config.appEmail;

// ❌ Bad
const sender = 'fixed@email.com';
```

### 3. **Error Logging**
Always log errors for debugging:
```javascript
try {
  await sendInvoiceEmail(...);
} catch (error) {
  console.error('Email send failed:', error);
  // Notify admin, log to monitoring service, etc.
}
```

### 4. **Rate Limiting**
Consider adding rate limits to prevent email abuse:
- Use `express-rate-limit` middleware on email endpoints
- Limit emails per IP and per user

### 5. **Email Templates**
Keep templates in separate files for easy maintenance:
```javascript
// ✅ Modular
const emailTemplate = require('@/emailTemplate/SendEmailTemplate');

// Email content changes don't affect business logic
```

---

## Troubleshooting

### Emails Not Sending
1. **Check API key:**
   ```bash
   echo $RESEND_API  # Should output: re_...
   ```

2. **Verify email address:**
   - Must be valid format (user@domain.com)
   - For custom domains, must be verified in Resend dashboard

3. **Check logs:**
   ```bash
   # Server logs should show email activity
   npm run dev 2>&1 | grep -i email
   ```

4. **Test Resend API directly:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H 'Authorization: Bearer YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "your-email@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

### High Email Bounce Rate
1. **Verify sender domain** in Resend dashboard
2. **Add DKIM records** for custom domains
3. **Clean up client email list** (remove invalid emails)
4. **Monitor bounce notifications** from Resend

### Development Testing Without Real Emails
1. Leave `RESEND_API` empty in `.env`
2. Emails are logged to console
3. Check server output for email content
4. Perfect for testing workflow without actual sends

---

## Configuration Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Email Service | `src/helpers/emailService.js` | Core email sending logic |
| Email Templates | `src/emailTemplate/` | HTML email templates |
| Controllers | `src/controllers/appControllers/*/sendMail.js` | API endpoints |
| Configuration | `src/config/index.js` | Env variable management |
| Environment | `.env` | Secret keys & settings |

---

## Support & Documentation

- **Resend API Docs:** https://resend.com/docs
- **Email Templates:** See `src/emailTemplate/` directory
- **Configuration:** See `src/config/index.js`
- **Email Service:** See `src/helpers/emailService.js`

