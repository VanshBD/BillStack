export const fields = {
  bankName: {
    type: 'string',
    required: true,
    label: 'Bank Name',
  },
  accountNumber: {
    type: 'string',
    required: true,
    label: 'Account Number',
  },
  accountHolderName: {
    type: 'string',
    required: true,
    label: 'Account Holder Name',
  },
  branchName: {
    type: 'string',
    label: 'Branch',
  },
  ifscCode: {
    type: 'string',
    label: 'IFSC Code',
  },
  enabled: {
    type: 'boolean',
    label: 'Enabled',
  },
  isDefault: {
    type: 'boolean',
    label: 'Set as Default',
    defaultValue: false,
  },
};
