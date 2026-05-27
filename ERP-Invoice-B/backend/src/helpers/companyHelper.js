const mongoose = require('mongoose');

const getCompanyDetails = async () => {
  try {
    const Setting = mongoose.model('Setting');
    const companySettings = await Setting.find({
      settingCategory: 'company_settings',
      enabled: true,
      removed: false
    });
    
    if (!companySettings || companySettings.length === 0) {
      console.warn('No company settings found, using defaults');
      return {
        company_name: 'COMPANY Name',
        company_address: 'Company Address',
        company_state: 'State',
        company_state_code: 'ST',
        company_pin_code: '000000',
        company_country: 'Country',
        company_email: 'email@example.com',
        company_phone: '+0000000000',
        company_website: 'www.example.com',
        company_gst_number: '',
        company_vat_number: '',
        company_reg_number: '',
        company_bank_name: 'Bank Name',
        company_bank_account: 'Account Number',
        company_bank_branch: 'Branch Name',
        company_bank_ifsc: 'IFSC Code',
        company_account_holder_name: 'Account Holder'
      };
    }
    
    const companyDetails = {};
    companySettings.forEach(setting => {
      companyDetails[setting.settingKey] = setting.settingValue;
    });
    
    return companyDetails;
  } catch (error) {
    console.error('Error fetching company details:', error.message);
    throw new Error('Failed to fetch company details');
  }
};

const getDefaultTerms = async (type = 'invoice') => {
  try {
    const Setting = mongoose.model('Setting');
    const settingKey = type === 'invoice' ? 'default_invoice_terms' : 'default_quote_terms';
    
    const termsSetting = await Setting.findOne({
      settingKey: settingKey,
      enabled: true,
      removed: false
    });
    
    if (!termsSetting) {
      console.warn(`No ${type} terms found, using default`);
      const defaultTerms = type === 'invoice' 
        ? '1. Payment is due within 30 days.\n2. Late payment is subject to a fee of 1.5% per month.\n3. Goods are sold under the following conditions:\n   - All goods are non-returnable after 7 days.\n   - Warranty applies as per manufacturer terms.\n4. This invoice is subject to the applicable tax laws.'
        : '1. This quote is valid for 30 days.\n2. Prices are subject to change without notice.\n3. Delivery terms are as specified.\n4. Warranty terms apply as per manufacturer.';
      return defaultTerms;
    }
    
    return termsSetting.settingValue || '';
  } catch (error) {
    console.error('Error fetching default terms:', error.message);
    throw new Error(`Failed to fetch ${type} terms`);
  }
};

const getBankDetails = async () => {
  try {
    const Setting = mongoose.model('Setting');
    const bankSettings = await Setting.find({
      settingCategory: 'company_settings',
      settingKey: { $in: ['company_bank_name', 'company_bank_account', 'company_bank_branch', 'company_bank_ifsc', 'company_account_holder_name'] },
      enabled: true,
      removed: false
    });
    
    if (!bankSettings || bankSettings.length === 0) {
      console.warn('No bank settings found, using defaults');
      return {
        bankName: 'Default Bank',
        bankAccount: '0000000000',
        bankBranch: 'Main Branch',
        bankIfsc: 'DEFAULT000',
        accountHolderName: 'Default Account Holder'
      };
    }
    
    const bankDetails = {};
    bankSettings.forEach(setting => {
      bankDetails[setting.settingKey] = setting.settingValue;
    });
    
    return {
      bankName: bankDetails.company_bank_name || '',
      bankAccount: bankDetails.company_bank_account || '',
      bankBranch: bankDetails.company_bank_branch || '',
      bankIfsc: bankDetails.company_bank_ifsc || '',
      accountHolderName: bankDetails.company_account_holder_name || ''
    };
  } catch (error) {
    console.error('Error fetching bank details:', error.message);
    throw new Error('Failed to fetch bank details');
  }
};

module.exports = {
  getCompanyDetails,
  getDefaultTerms,
  getBankDetails
};
