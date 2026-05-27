import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Divider, Button, Modal, Typography, Space } from 'antd';
import { PlusOutlined, ShoppingOutlined, PercentageOutlined, FileTextOutlined, NumberOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import TaxForm from './TaxForm';
import { useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';

const { Text } = Typography;

export default function ProductForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const [taxes, setTaxes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taxLoading, setTaxLoading] = useState(false);
  const form = Form.useFormInstance();
  const [taxForm] = Form.useForm();

  const fetchTaxes = async () => {
    setTaxLoading(true);
    try {
      const response = await request.list({ entity: 'taxes' });
      if (response.success) {
        setTaxes(response.result);
      }
    } catch (error) {
      console.error('Failed to fetch taxes:', error);
    } finally {
      setTaxLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleCreateTax = async (values) => {
    try {
      const response = await request.create({ entity: 'taxes', jsonData: values });
      if (response.success) {
        setIsModalOpen(false);
        taxForm.resetFields();
        await fetchTaxes();
        // Automatically select the newly created tax
        if (form) {
          form.setFieldsValue({ taxCategory: response.result._id });
        }
      }
    } catch (error) {
      console.error('Failed to create tax:', error);
    }
  };

  return (
    <>
      <div style={{ padding: '0 10px' }}>
        <Divider orientation="left" style={{ marginTop: 0 }}>
          <Space>
            <ShoppingOutlined />
            <Text strong>{translate('Product Information')}</Text>
          </Space>
        </Divider>

        <Form.Item
          label={translate('Product Name')}
          name="name"
          rules={[{ required: true, message: translate('Please input product name!') }]}
        >
          <Input 
            prefix={<ShoppingOutlined className="site-form-item-icon" />} 
            placeholder={translate('Enter product name')} 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={translate('HSN Code')}
          name="hsnCode"
        >
          <Input 
            prefix={<NumberOutlined className="site-form-item-icon" />} 
            placeholder={translate('Enter HSN code')} 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={translate('Unit')}
          name="unit"
          initialValue="pcs"
        >
          <Input 
            placeholder={translate('Enter unit (e.g. pcs, kg, box)')} 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={translate('Tax Category')}
          name="taxCategory"
          rules={[{ required: true, message: translate('Please select tax category!') }]}
        >
          <Select
            placeholder={translate('Select tax category')}
            size="large"
            loading={taxLoading}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Button 
                  type="text" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsModalOpen(true)}
                  style={{ width: '100%', textAlign: 'left', padding: '0 12px' }}
                >
                  {translate('Add New Tax')}
                </Button>
              </>
            )}
            options={taxes
              .filter(tax => tax.enabled)
              .map((tax) => ({
                label: `${tax.taxName} (${tax.taxValue}%)`,
                value: tax._id,
              }))}
          />
        </Form.Item>

        <Form.Item
          label={translate('Price')}
          name="price"
          rules={[{ required: true, message: translate('Please input price!') }]}
        >
          <InputNumber
            className="site-form-item-icon"
            style={{ width: '100%' }}
            placeholder={translate('0.00')}
            size="large"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label={translate('Description')}
          name="description"
        >
          <Input.TextArea 
            rows={4} 
            placeholder={translate('Enter product description')} 
          />
        </Form.Item>

        {isUpdateForm && (
          <Form.Item
            label={translate('SKU')}
            name="sku"
          >
            <Input 
              prefix={<FileTextOutlined className="site-form-item-icon" />} 
              disabled 
              size="large"
            />
          </Form.Item>
        )}
      </div>

      <Modal
        title={translate('Create New Tax')}
        open={isModalOpen}
        onOk={() => taxForm.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText={translate('Create')}
        cancelText={translate('Cancel')}
      >
        <Form
          form={taxForm}
          layout="vertical"
          onFinish={handleCreateTax}
          initialValues={{ enabled: true }}
        >
          <TaxForm />
        </Form>
      </Modal>
    </>
  );
}
