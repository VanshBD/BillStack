export const fields = {
  name: {
    type: 'string',
    label: 'Company',
    required: true,
  },
  gstNumber: {
    type: 'string',
    label: 'GST Number',
    length: 10,
  },
  phone: {
    type: 'phone',
  },
  email: {
    type: 'email',
    length: 15,
  },
  country: {
    type: 'string',
    label: 'Country',
    disableForTable: true,
  },
  state: {
    type: 'string',
    label: 'State',
    required: true,
  },
  stateCode: {
    type: 'string',
    label: 'State Code',
    required: true,
    disableForTable: true,
  },
  billingAddress: {
    type: 'string',
    label: 'Billing Address',
    length: 30,
  },
  shippingAddress: {
    type: 'string',
    label: 'Shipping Address',
    disableForTable: true,
  },
};
