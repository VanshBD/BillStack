import { Form, Input, Select, Switch, Row, Col, Divider, Typography } from 'antd';
import { validatePhoneNumber } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';
import { indianStates } from '@/utils/indianStates';
import { countryList } from '@/utils/countryList';
import { useEffect } from 'react';
import { EnvironmentOutlined, ShopOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';

const { Text } = Typography;

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

  const handleStateChange = (value, option) => {
    if (option) {
      form.setFieldsValue({ stateCode: option.code });
    } else {
      form.setFieldsValue({ stateCode: null });
    }
  };

  const handleStateCodeChange = (value, option) => {
    if (option) {
      form.setFieldsValue({ state: option.state });
    } else {
      form.setFieldsValue({ state: null });
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
            label="GST Number"
            rules={[
              { validator: validateEmptyString },
            ]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Enter GST Number" />
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
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {countryList.map((country) => (
                <Select.Option key={country.value} value={country.value} label={translate(country.label)}>
                  {country?.icon && country?.icon + ' '}
                  {translate(country.label)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="state"
            label="State"
            rules={[{ required: true, message: 'State is required' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select State"
              optionFilterProp="children"
              onChange={handleStateChange}
              filterOption={(input, option) =>
                (option?.state ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {indianStates.map((state) => (
                <Select.Option key={state.value} value={state.state} state={state.state} code={state.code}>
                  {state.state}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="stateCode"
            label="State Code"
            rules={[{ required: true, message: 'State Code is required' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Code"
              optionFilterProp="children"
              onChange={handleStateCodeChange}
              filterOption={(input, option) =>
                (option?.code ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {indianStates.map((state) => (
                <Select.Option key={state.value} value={state.code} state={state.state} code={state.code}>
                  {state.code}
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
