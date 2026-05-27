const mongoose = require('mongoose');

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

const validateGstNumber = (gstNumber) => {
  if (!gstNumber || gstNumber.trim() === '') {
    return true; // Empty GST number is allowed
  }
  
  // Basic GST number validation for India (15 characters, alphanumeric)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber.toUpperCase());
};

module.exports = {
  getCompanyGstNumber,
  validateGstNumber
};
