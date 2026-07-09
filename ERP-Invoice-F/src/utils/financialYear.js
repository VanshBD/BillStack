/**
 * Frontend utility for Indian Financial Year.
 * FY runs April 1 → March 31.
 */

/**
 * Returns the current FY label string.
 * e.g. called on 15-Jul-2025  → "2025/26"
 *      called on 15-Jan-2026  → "2025/26"
 *      called on  1-Apr-2026  → "2026/27"
 */
export function getCurrentFYLabel(date = new Date()) {
  const month = date.getMonth(); // 0-indexed; 3 = April
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}/${String(endYear).slice(-2)}`; // e.g. "2025/26"
}

/**
 * Build the display invoice/quote number.
 * e.g. formatDisplayNumber(87, "2025/26") → "87-2025/26"
 */
export function formatDisplayNumber(sequentialNumber, fyLabel) {
  if (!sequentialNumber || !fyLabel) return '';
  return `${sequentialNumber}-${fyLabel}`;
}
