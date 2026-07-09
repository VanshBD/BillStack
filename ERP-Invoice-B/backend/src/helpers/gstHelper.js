const mongoose = require('mongoose');

/**
 * Indian State GST Code Mapping
 * Official GST state codes as per Indian GST Law
 */
const GST_STATE_CODES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

/**
 * Get company GST number from settings
 */
const getCompanyGstNumber = async () => {
  try {
    const Setting = mongoose.model('Setting');
    const gstSetting = await Setting.findOne({
      settingKey: 'company_gst_number',
      enabled: true,
      removed: false
    });
    
    return gstSetting ? gstSetting.settingValue : '';
  } catch (error) {
    console.error('Error fetching company GST number:', error);
    return '';
  }
};

/**
 * Get company state from settings
 */
const getCompanyState = async () => {
  try {
    const Setting = mongoose.model('Setting');
    const stateSetting = await Setting.findOne({
      settingKey: 'company_state',
      enabled: true,
      removed: false
    });
    
    return stateSetting ? stateSetting.settingValue : '';
  } catch (error) {
    console.error('Error fetching company state:', error);
    return '';
  }
};

/**
 * Get company state code from settings
 */
const getCompanyStateCode = async () => {
  try {
    const Setting = mongoose.model('Setting');
    const stateCodeSetting = await Setting.findOne({
      settingKey: 'company_state_code',
      enabled: true,
      removed: false
    });
    
    return stateCodeSetting ? stateCodeSetting.settingValue : '';
  } catch (error) {
    console.error('Error fetching company state code:', error);
    return '';
  }
};

/**
 * Validate GST number format
 * Format: 2 digits state code + 10 alphanumeric PAN + 1 entity code + 1 Z + 1 alphanumeric
 */
const validateGstNumber = (gstNumber) => {
  if (!gstNumber || gstNumber.trim() === '') {
    return true; // Empty GST number is allowed
  }
  
  // Basic GST number validation for India (15 characters, alphanumeric)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber.toUpperCase());
};

/**
 * Extract state code from GST number (first 2 digits)
 */
const extractStateCodeFromGst = (gstNumber) => {
  if (!gstNumber || gstNumber.length < 2) {
    return null;
  }
  return gstNumber.substring(0, 2);
};

/**
 * Get state name from state code
 */
const getStateNameFromCode = (stateCode) => {
  if (!stateCode) return null;
  
  // Normalize to 2 digits with leading zero if needed
  const normalizedCode = stateCode.toString().padStart(2, '0');
  return GST_STATE_CODES[normalizedCode] || null;
};

/**
 * Get state code from state name (case-insensitive partial match)
 */
const getStateCodeFromName = (stateName) => {
  if (!stateName) return null;
  
  const normalizedName = stateName.toLowerCase().trim();
  
  // Exact match first
  for (const [code, name] of Object.entries(GST_STATE_CODES)) {
    if (name.toLowerCase() === normalizedName) {
      return code;
    }
  }
  
  // Partial match
  for (const [code, name] of Object.entries(GST_STATE_CODES)) {
    if (name.toLowerCase().includes(normalizedName) || normalizedName.includes(name.toLowerCase())) {
      return code;
    }
  }
  
  return null;
};

/**
 * Determine tax type (IGST or CGST+SGST) based on state comparison
 * Returns 'igst' for interstate, 'cgst_sgst' for intrastate
 */
const determineTaxType = (companyState, clientState, companyStateCode = null, clientStateCode = null) => {
  // If state codes are provided, use them for precise comparison
  if (companyStateCode && clientStateCode) {
    const normalizedCompanyCode = companyStateCode.toString().padStart(2, '0');
    const normalizedClientCode = clientStateCode.toString().padStart(2, '0');
    return normalizedCompanyCode === normalizedClientCode ? 'cgst_sgst' : 'igst';
  }
  
  // Fall back to state name comparison (case-insensitive)
  if (companyState && clientState) {
    const normalizedCompanyState = companyState.toLowerCase().trim();
    const normalizedClientState = clientState.toLowerCase().trim();
    return normalizedCompanyState === normalizedClientState ? 'cgst_sgst' : 'igst';
  }
  
  // Default to CGST+SGST if comparison is not possible
  return 'cgst_sgst';
};

/**
 * Auto-detect tax type for an invoice/quote based on client and company settings
 */
const autoDetectTaxType = async (clientId) => {
  try {
    const Client = mongoose.model('Client');
    const client = await Client.findById(clientId);
    
    if (!client) {
      return 'cgst_sgst'; // Default
    }
    
    const companyState = await getCompanyState();
    const companyStateCode = await getCompanyStateCode();
    
    return determineTaxType(
      companyState,
      client.state,
      companyStateCode,
      client.stateCode
    );
  } catch (error) {
    console.error('Error auto-detecting tax type:', error);
    return 'cgst_sgst'; // Default fallback
  }
};

/**
 * Validate that state code matches state name
 */
const validateStateCodeMatch = (stateName, stateCode) => {
  if (!stateName || !stateCode) return true; // Skip if either is missing
  
  const expectedStateName = getStateNameFromCode(stateCode);
  if (!expectedStateName) return false;
  
  const normalizedExpected = expectedStateName.toLowerCase().trim();
  const normalizedActual = stateName.toLowerCase().trim();
  
  return normalizedExpected === normalizedActual;
};

module.exports = {
  GST_STATE_CODES,
  getCompanyGstNumber,
  getCompanyState,
  getCompanyStateCode,
  validateGstNumber,
  extractStateCodeFromGst,
  getStateNameFromCode,
  getStateCodeFromName,
  determineTaxType,
  autoDetectTaxType,
  validateStateCodeMatch,
};
