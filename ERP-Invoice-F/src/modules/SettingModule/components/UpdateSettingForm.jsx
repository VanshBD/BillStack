import { Children, cloneElement, isValidElement, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';

import { Button, Form } from 'antd';
import Loading from '@/components/Loading';
import useLanguage from '@/locale/useLanguage';
import useDate from '@/settings/useDate';

export default function UpdateSettingForm({ config, children, withUpload, uploadSettingKey }) {
  let { entity, settingsCategory } = config;
  const dispatch = useDispatch();
  const { result, isLoading } = useSelector(selectSettings);
  const translate = useLanguage();
  const [form] = Form.useForm();
  const { dateFormat } = useDate();
  const current = { ...(result[settingsCategory] || {}) };

  const onSubmit = (fieldsValue) => {
    console.log('🚀 ~ onSubmit ~ fieldsValue:', fieldsValue);
    if (withUpload) {
      if (fieldsValue.file) {
        fieldsValue.file = fieldsValue.file[0].originFileObj;
      }
      dispatch(
        settingsAction.upload({ entity, settingKey: uploadSettingKey, jsonData: fieldsValue })
      );
    } else {
      const settings = [];

      for (const [key, value] of Object.entries(fieldsValue)) {
        if (value !== undefined) {
          settings.push({ settingKey: key, settingValue: value || null });
        }
      }

      dispatch(settingsAction.updateMany({ entity, jsonData: { settings } }));
    }
  };

  useEffect(() => {
    const values = { ...current };

    const companySettings = result.company_settings || {};

    if (
      settingsCategory === 'app_settings' &&
      companySettings.company_email &&
      !values.bizinvo_app_company_email
    ) {
      values.bizinvo_app_company_email = companySettings.company_email;
    }

    if (!values.bizinvo_app_date_format) {
      values.bizinvo_app_date_format = dateFormat;
    }

    form.setFieldsValue(values);
  }, [result, settingsCategory, dateFormat, form, current]);

  const enhancedChildren = Children.map(children, (child) =>
    isValidElement(child) ? cloneElement(child, { currentSettings: current, form }) : child
  );

  return (
    <div>
      <Loading isLoading={isLoading}>
        <Form
          form={form}
          onFinish={onSubmit}
          // onValuesChange={handleValuesChange}
          labelCol={{ span: 10 }}
          labelAlign="left"
          wrapperCol={{ span: 16 }}
        >
          {enhancedChildren}
          <Form.Item
            style={{
              display: 'inline-block',
              paddingRight: '5px',
            }}
          >
            <Button type="primary" htmlType="submit">
              {translate('Save')}
            </Button>
          </Form.Item>
          <Form.Item
            style={{
              display: 'inline-block',
              paddingLeft: '5px',
            }}
          >
            {/* <Button onClick={() => console.log('Cancel clicked')}>{translate('Cancel')}</Button> */}
          </Form.Item>
        </Form>
      </Loading>
    </div>
  );
}
