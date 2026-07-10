const pug = require('pug');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { loadSettings } = require('@/middlewares/settings');
const useLanguage = require('@/locale/useLanguage');
const { useMoney, useDate } = require('@/settings');
const config = require('../../config');

// Document type configurations — drives all rendering decisions
const DOC_CONFIGS = {
  invoice: {
    title: 'invoice',
    partyLabel: 'Client',
    showExpiredDate: true,
    showItemsTable: true,
    showTax: true,
    showBankDetails: true,
    showTerms: true,
    showPaymentSummary: false,
  },
  quote: {
    title: 'quote',
    partyLabel: 'Client',
    showExpiredDate: true,
    showItemsTable: true,
    showTax: true,
    showBankDetails: true,
    showTerms: true,
    showPaymentSummary: false,
  },
  offer: {
    title: 'offer',
    partyLabel: 'Lead',
    showExpiredDate: true,
    showItemsTable: true,
    showTax: true,
    showBankDetails: false,
    showTerms: true,
    showPaymentSummary: false,
  },
  payment: {
    title: 'Payment Receipt',
    partyLabel: 'Client',
    showExpiredDate: false,
    showItemsTable: false,
    showTax: false,
    showBankDetails: false,
    showTerms: false,
    showPaymentSummary: true,
  },
};

// Normalize party from any source (client, lead, or already-normalized party)
function resolveParty(model) {
  if (model.party) return model.party;
  const src = model.client || model.lead || {};
  return {
    name: src.name || '',
    company: src.company || '',
    address: src.address || '',
    phone: src.phone || '',
    email: src.email || '',
    gst: src.gst || src.taxID || '',
    state: src.state || '',
    stateCode: src.stateCode || '',
  };
}

// Normalize calculation fields — supports IGST and CGST+SGST
function resolveCalculation(model) {
  if (model.calculation) return model.calculation;
  
  // Normalize taxType: backend stores 'igst' or 'cgst_sgst', PDF expects 'SINGLE' or 'CGST_SGST'
  let taxType = 'SINGLE'; // Default to IGST (single tax)
  if (model.taxType) {
    taxType = model.taxType === 'cgst_sgst' ? 'CGST_SGST' : 'SINGLE';
  } else if (model.taxType === undefined && model.taxTotal) {
    // Legacy: if taxType not set, default to SINGLE for backward compatibility
    taxType = 'SINGLE';
  }
  
  return {
    subTotal: model.subTotal || 0,
    taxType: taxType,
    taxRate: model.taxRate || 0,
    taxAmount: model.taxTotal || 0,
    total: model.total || 0,
    taxBreakdown: model.taxBreakdown || [],
  };
}

exports.generatePdf = (
  modelName,
  info = { filename: 'pdf_file', format: 'A4', targetLocation: '' },
  result,
  callback
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { targetLocation } = info;
      const key = modelName.toLowerCase();

      const docConfig = DOC_CONFIGS[key];
      if (!docConfig) {
        return reject(new Error(`No PDF config found for model: ${modelName}`));
      }

      // Ensure output directory exists
      const dir = path.dirname(targetLocation);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Remove stale PDF
      if (fs.existsSync(targetLocation)) {
        fs.unlinkSync(targetLocation);
      }

      const settings = await loadSettings();
      const selectedLang = settings['billstack_app_language'];
      const translate = useLanguage({ selectedLang });

      const { currency_symbol, currency_position, decimal_sep, thousand_sep, cent_precision, zero_format } = settings;
      const { moneyFormatter } = useMoney({
        settings: { currency_symbol, currency_position, decimal_sep, thousand_sep, cent_precision, zero_format },
      });
      let { dateFormat } = useDate({ settings });
      if (!dateFormat) {
        dateFormat = 'DD/MM/YYYY';
      }

      let pubServerFile = config.publicServerFile || '';
      if (pubServerFile && !pubServerFile.endsWith('/')) {
        pubServerFile += '/';
      }
      settings.public_server_file = pubServerFile;

      if (settings.company_logo && settings.company_logo.startsWith('/')) {
        settings.company_logo = settings.company_logo.substring(1);
      }

      // Theme — reads from settings or falls back to defaults
      const theme = {
        primaryColor:    settings.pdf_primary_color    || '#52008c',
        secondaryColor:  settings.pdf_secondary_color  || '#5d6975',
        accentColor:     settings.pdf_accent_color     || '#c2e0f2',
        tableBorderColor:settings.pdf_table_border_color || '#888888',
        headerBgColor:   settings.pdf_header_bg_color  || '#b8d9f0',
        fontSize:        settings.pdf_font_size        || '13',
        fontFamily:      settings.pdf_font_family      || 'Arial, sans-serif',
        invoiceTitle:    settings.pdf_invoice_title    || null,
      };

      // Enrich model with normalized party + calculation
      const mongoose = require('mongoose');
      const Product = mongoose.models.Product || mongoose.model('Product');

      const rawModel = result.toObject ? result.toObject() : result;
      const enrichedItems = [];

      if (rawModel.items && Array.isArray(rawModel.items)) {
        for (const item of rawModel.items) {
          const itemObj = Object.assign({}, item);
          if (!itemObj.hsnCode || !itemObj.unit) {
            try {
              const product = await Product.findOne({ name: itemObj.itemName, removed: false });
              if (product) {
                itemObj.hsnCode = itemObj.hsnCode || product.hsnCode;
                itemObj.unit = itemObj.unit || product.unit;
              }
            } catch (err) {
              console.error('Error fetching product for PDF enrichment:', err);
            }
          }
          itemObj.hsnCode = itemObj.hsnCode || '-';
          itemObj.unit = itemObj.unit || 'PCS';
          enrichedItems.push(itemObj);
        }
      }

      const enrichedModel = Object.assign({}, rawModel, {
        party: resolveParty(result),
        calculation: resolveCalculation(result),
        items: enrichedItems,
        taxBreakdown: rawModel.taxBreakdown || [],
      });

      // Indian number to words function
      const numberToWordsIndian = (num) => {
        if (!num || num === 0) return 'Rupees Zero Only';
        num = Math.round(num * 100) / 100;
        const parts = num.toString().split('.');
        const integerPart = parseInt(parts[0], 10);
        const decimalPart = parts[1] ? parseInt(parts[1], 10) : 0;

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convert(n) {
          if (n < 20) return ones[n];
          if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
          if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
          if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
          if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
          return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
        }

        let words = 'Rupees ' + convert(integerPart);
        if (decimalPart > 0) {
          let decimalVal = decimalPart;
          if (parts[1].length === 1) decimalVal *= 10;
          words += ' and ' + convert(decimalVal) + ' Paise';
        }
        words += ' Only';
        return words;
      };

      const htmlContent = pug.renderFile('src/pdf/document.pug', {
        model: enrichedModel,
        settings,
        docConfig,
        theme,
        translate,
        dateFormat,
        moneyFormatter,
        moment,
        numberToWordsIndian,
      });

      const puppeteer = require('puppeteer');

      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: targetLocation,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '8mm',
          right: '7mm',
          bottom: '8mm',
          left: '7mm',
        },
      });

      await browser.close();

      if (callback) callback();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
