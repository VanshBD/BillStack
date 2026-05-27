export const fields = {
  title: {
    type: 'string',
    required: true,
    min: 2,
    max: 200,
    label: 'Term Title',
  },
  content: {
    type: 'textarea',
    required: true,
    min: 10,
    max: 5000,
    label: 'Terms Content',
  },
  isDefault: {
    type: 'boolean',
    label: 'Set as Default',
    defaultValue: false,
  },
  enabled: {
    type: 'boolean',
    label: 'Enabled',
    defaultValue: true,
  },
};
