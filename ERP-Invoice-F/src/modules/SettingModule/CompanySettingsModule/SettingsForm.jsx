import { Form, Input, Select, Row, Col } from 'antd';
import { useEffect } from 'react';
import useLanguage from '@/locale/useLanguage';
import { countryList } from '@/utils/countryList';
import { indianStates } from '@/utils/indianStates';

export default function SettingForm() {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const countryCode = Form.useWatch('company_country', form);
  const isIndia = !countryCode || countryCode === 'IN' || countryCode === 'India';

  const handleStateChange = (value) => {
    const selectedState = indianStates.find((s) => s.state === value);
    if (selectedState) {
      form.setFieldsValue({ company_state_code: selectedState.code });
    } else {
      form.setFieldsValue({ company_state_code: null });
    }
  };

  const handleStateCodeChange = (value) => {
    const selectedState = indianStates.find((s) => s.code === value);
    if (selectedState) {
      form.setFieldsValue({ company_state: selectedState.state });
    } else {
      form.setFieldsValue({ company_state: null });
    }
  };

  return (
    <div>
      <Form.Item label={translate('company_name')} name="company_name">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_address')} name="company_address">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_country')} name="company_country">
        <Select
          showSearch
          allowClear
          placeholder={translate('Select country')}
          optionFilterProp="label"
          options={countryList.map((c) => ({ label: translate(c.label), value: c.value }))}
        />
      </Form.Item>

      {isIndia ? (
        <>
          <Form.Item
            label={translate('company_state')}
            name="company_state"
            rules={[{ required: true, message: 'State is required' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select State"
              optionFilterProp="label"
              onChange={handleStateChange}
              options={indianStates.map((state) => ({
                label: state.state,
                value: state.state,
                state: state.state,
                code: state.code,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                (option?.state ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            label={translate('company_state_code')}
            name="company_state_code"
            rules={[{ required: true, message: 'State Code is required' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Code"
              optionFilterProp="label"
              onChange={handleStateCodeChange}
              options={indianStates.map((state) => ({
                label: state.code,
                value: state.code,
                state: state.state,
                code: state.code,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                (option?.code ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item label={translate('company_state')} name="company_state">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item label={translate('company_state_code')} name="company_state_code">
            <Input autoComplete="off" />
          </Form.Item>
        </>
      )}

      <Form.Item label={translate('company_pin_code')} name="company_pin_code">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_email')} name="company_email">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_phone')} name="company_phone">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_website')} name="company_website">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_tax_number')} name="company_tax_number">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_gst_number')} name="company_gst_number">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_vat_number')} name="company_vat_number">
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item label={translate('company_reg_number')} name="company_reg_number">
        <Input autoComplete="off" />
      </Form.Item>
    </div>
  );
}
