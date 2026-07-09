import { Form, Input, Select, Switch, Row, Col, Divider, Typography, Tooltip } from 'antd';
import { validatePhoneNumber } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';
import { indianStates } from '@/utils/indianStates';
import { countryList } from '@/utils/countryList';
import { useEffect } from 'react';
import { EnvironmentOutlined, ShopOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Build searchable options for Ant Design Select
const countryOptions = countryList.map((country) => ({
  label: (country.icon ? country.icon + ' ' : '') + country.label,
  value: country.value,
  // searchable text — plain string used by filterOption
  search: country.label.toLowerCase(),
}));

export default function CustomerForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const isShippingSameAsBilling = Form.useWatch('isShippingSameAsBilling', form);
  
  const validateEmptyString = (_, value) => {
    if (value && value.trim() === '') {
      return Promise.reject(new Error('Field cannot be empty'));
    }
    return Promise.resolve();
  };

  // When state name is selected → auto-fill state code
  const handleStateChange = (value, option) => {
    if (option) {
      form.setFieldsValue({ stateCode: option['data-code'] });
    } else {
      form.setFieldsValue({ stateCode: null });
    }
  };

  // When state code is selected → auto-fill state name
  const handleStateCodeChange = (value, option) => {
    if (option) {
      form.setFieldsValue({ state: option['data-state'] });
    } else {
      form.setFieldsValue({ state: null });
    }
  };

  // When GST number is entered → auto-extract state code from first 2 digits
  const handleGstChange = (e) => {
    const gstValue = e.target.value || '';
    if (gstValue.length >= 2) {
      const extractedCode = gstValue.substring(0, 2);
      if (/^\d{2}$/.test(extractedCode)) {
        const matchedState = indianStates.find(s => s.code === extractedCode);
        if (matchedState) {
          form.setFieldsValue({
            stateCode: matchedState.code,
            state: matchedState.state,
          });
        }
      }
    }
  };

  // Set default values
  useEffect(() => {
    if (form.getFieldValue('isShippingSameAsBilling') === undefined) {
      form.setFieldsValue({ isShippingSameAsBilling: true });
    }
    if (!form.getFieldValue('country')) {
      form.setFieldsValue({ country: 'IN' });
    }
  }, [form]);

  return (
    <div style={{ padding: '10px 0' }}>
      <Divider orientation="left" plain>
        <Text type="secondary" strong>
          <ShopOutlined /> {translate('Company Information')}
        </Text>
      </Divider>
      
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={translate('company')}
            name="name"
            rules={[
              { required: true },
              { validator: validateEmptyString },
            ]}
          >
            <Input prefix={<ShopOutlined className="site-form-item-icon" />} placeholder="Enter Company Name" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label={translate('Phone')}
            rules={[
              { validator: validateEmptyString },
              { pattern: validatePhoneNumber, message: 'Please enter a valid phone number' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label={translate('email')}
            rules={[
              { type: 'email' },
              { validator: validateEmptyString },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email Address" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="gstNumber"
            label={
              <span>
                GST Number{' '}
                <Tooltip title="State code is auto-detected from the first 2 digits of your GST number">
                  <InfoCircleOutlined style={{ color: '#1677ff', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            rules={[{ validator: validateEmptyString }]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="e.g. 24ABCDE1234F1Z5"
              onChange={handleGstChange}
              maxLength={15}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left" plain style={{ marginTop: '30px' }}>
        <Text type="secondary" strong>
          <EnvironmentOutlined /> {translate('Address Details')}
        </Text>
      </Divider>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="country"
            label={translate('Country')}
            initialValue="IN"
          >
            <Select
              showSearch
              placeholder="Search country..."
              optionFilterProp="search"
              options={countryOptions}
              optionRender={(option) => (
                <span>{option.data.label}</span>
              )}
              filterOption={(input, option) =>
                (option?.search ?? '').includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="state"
            label="State"
            rules={[{ required: true, message: 'State is required' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select State"
              filterOption={(input, option) =>
                (option?.['data-state'] ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleStateChange}
            >
              {indianStates.map((s) => (
                <Select.Option key={s.code} value={s.state} data-state={s.state} data-code={s.code}>
                  <span style={{ marginRight: 8, color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>{s.code}</span>
                  {s.state}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="stateCode"
            label="State Code"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Code"
              filterOption={(input, option) =>
                (option?.['data-code'] ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleStateCodeChange}
            >
              {indianStates.map((s) => (
                <Select.Option key={s.code} value={s.code} data-state={s.state} data-code={s.code}>
                  {s.code}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="billingAddress"
            label="Billing Address"
            rules={[{ required: true, message: 'Billing Address is required' }]}
          >
            <Input.TextArea rows={3} placeholder="Full Billing Address" />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ 
        background: '#f9f9f9', 
        padding: '15px', 
        borderRadius: '8px', 
        border: '1px solid #f0f0f0',
        marginBottom: '20px'
      }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Text strong>Shipping Address is same as Billing</Text>
          </Col>
          <Col>
            <Form.Item
              name="isShippingSameAsBilling"
              valuePropName="checked"
              noStyle
            >
              <Switch size="small" />
            </Form.Item>
          </Col>
        </Row>

        {!isShippingSameAsBilling && (
          <div style={{ marginTop: '15px' }}>
            <Form.Item
              name="shippingAddress"
              label="Shipping Address"
              rules={[{ required: true, message: 'Shipping Address is required' }]}
            >
              <Input.TextArea rows={3} placeholder="Full Shipping Address" />
            </Form.Item>
          </div>
        )}
      </div>
    </div>
  );
}
