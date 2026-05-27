import { Button, Form, message, Upload } from 'antd';

import { UploadOutlined } from '@ant-design/icons';

import { useSelector } from 'react-redux';
import { selectCompanySettings } from '@/redux/settings/selectors';
import useLanguage from '@/locale/useLanguage';

export default function AppSettingForm() {
  const translate = useLanguage();
  const companySettings = useSelector(selectCompanySettings);
  const backendUrl = import.meta.env.VITE_BACKEND_SERVER || '';
  const logoPath = companySettings && companySettings.company_logo;
  const currentLogoUrl =
    backendUrl && logoPath
      ? `${backendUrl.replace(/\/$/, '')}/${logoPath.replace(/^\/?/, '')}`
      : null;
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Image must smaller than 5MB!');
    }
    return false;
  };
  return (
    <>
      {currentLogoUrl && (
        <Form.Item label="Current Logo">
          <img
            src={currentLogoUrl}
            alt="Current company logo"
            style={{ maxHeight: 80, maxWidth: 280, objectFit: 'cover' }}
          />
        </Form.Item>
      )}
      <Form.Item
        name="file"
        label="Logo"
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload
          beforeUpload={beforeUpload}
          listType="picture"
          accept="image/png, image/jpeg"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>{translate('click_to_upload')}</Button>
        </Upload>
      </Form.Item>
    </>
  );
}
