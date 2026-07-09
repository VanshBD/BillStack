/**
 * Indian Financial Year utilities.
 *
 * Indian FY runs April 1 → March 31.
 * Format used in invoice numbers: {number}-{YYYY}/{YY}
 * e.g.  87-2025/26  means sequential #87 in FY 2025-26
 */

const mongoose = require('mongoose');

/**
 * Get the current Indian Financial Year as an object.
 * e.g. on 15 July 2025 → { startYear: 2025, endYear: 2026, label: '2025/26' }
 * e.g. on 15 Jan  2026 → { startYear: 2025, endYear: 2026, label: '2025/26' }
 * e.g. on 1 Apr   2026 → { startYear: 2026, endYear: 2027, label: '2026/27' }
 */
const getCurrentFY = (date = new Date()) => {
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  const year = date.getFullYear();

  // FY starts in April (month index 3)
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const label = `${startYear}/${String(endYear).slice(-2)}`; // e.g. "2025/26"

  return { startYear, endYear, label };
};

/**
 * Get the stored FY label from settings.
 * Returns null if not set yet.
 */
const getStoredFYLabel = async () => {
  try {
    const Setting = mongoose.model('Setting');
    const doc = await Setting.findOne({ settingKey: 'current_financial_year', removed: false });
    return doc ? doc.settingValue : null;
  } catch {
    return null;
  }
};

/**
 * Update the stored FY label in settings.
 */
const setStoredFYLabel = async (label) => {
  try {
    const Setting = mongoose.model('Setting');
    await Setting.findOneAndUpdate(
      { settingKey: 'current_financial_year' },
      {
        settingKey: 'current_financial_year',
        settingCategory: 'finance_settings',
        settingValue: label,
        valueType: 'string',
        removed: false,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Error updating FY setting:', err.message);
  }
};

/**
 * Reset the invoice counter back to 1 in settings.
 */
const resetInvoiceCounter = async () => {
  try {
    const Setting = mongoose.model('Setting');
    await Setting.findOneAndUpdate(
      { settingKey: 'last_invoice_number' },
      { $set: { settingValue: 0 } }
    );
    console.log('🔄 Invoice counter reset for new financial year.');
  } catch (err) {
    console.error('Error resetting invoice counter:', err.message);
  }
};

/**
 * Reset the quote counter back to 0 in settings.
 */
const resetQuoteCounter = async () => {
  try {
    const Setting = mongoose.model('Setting');
    await Setting.findOneAndUpdate(
      { settingKey: 'last_quote_number' },
      { $set: { settingValue: 0 } }
    );
    console.log('🔄 Quote counter reset for new financial year.');
  } catch (err) {
    console.error('Error resetting quote counter:', err.message);
  }
};

/**
 * Check if the financial year has changed and auto-reset counters if so.
 * Call this at the start of invoice/quote creation.
 * Returns the current FY label string e.g. "2025/26".
 */
const checkAndHandleFYRollover = async () => {
  const currentFY = getCurrentFY();
  const storedLabel = await getStoredFYLabel();

  if (storedLabel && storedLabel !== currentFY.label) {
    // FY has changed — reset counters
    console.log(`📅 Financial year changed: ${storedLabel} → ${currentFY.label}`);
    await resetInvoiceCounter();
    await resetQuoteCounter();
  }

  // Always update stored FY to current
  await setStoredFYLabel(currentFY.label);

  return currentFY.label;
};

/**
 * Build the display invoice number string.
 * e.g. formatInvoiceNumber(87, '2025/26') → '87-2025/26'
 */
const formatInvoiceNumber = (sequentialNumber, fyLabel) => {
  return `${sequentialNumber}-${fyLabel}`;
};

/**
 * Build a safe filename from the display number.
 * e.g. '87-2025/26' → 'invoice-87-2025-26'
 */
const safeFileName = (modelType, displayNumber, id) => {
  const safe = displayNumber.replace(/\//g, '-').replace(/\s+/g, '_');
  return `${modelType}-${safe}-${id}.pdf`;
};

module.exports = {
  getCurrentFY,
  checkAndHandleFYRollover,
  formatInvoiceNumber,
  safeFileName,
};
