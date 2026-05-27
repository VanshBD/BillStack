import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const money = useMoney();
  const form = Form.useFormInstance();

  const updateQt = (value) => {
    setQuantity(value);
  };
  const updatePrice = (value) => {
    setPrice(value);
  };

  useEffect(() => {
    if (current) {
      const { items, invoice } = current;
      const item = invoice ? invoice[field.fieldKey] : items[field.fieldKey];
      if (item) {
        setQuantity(item.quantity);
        setPrice(item.price);
      }
    }
  }, [current, field.fieldKey]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
    
    // Update the form field for total
    const items = form.getFieldValue('items') || [];
    if (items[field.name]) {
      items[field.name].total = currentTotal;
      form.setFieldsValue({ items });
    }
  }, [price, quantity, field.name, form]);

  const onProductChange = (value, option) => {
    if (option) {
      const items = form.getFieldValue('items') || [];
      if (items[field.name]) {
        items[field.name].itemName = option.name;
        items[field.name].price = option.price;
        items[field.name].description = option.description;
        form.setFieldsValue({ items });
        
        setPrice(option.price);
      }
    }
  };

  return (
    <Row gutter={[12, 12]} className="invoice-item-row" align="middle">
      <Col span={7}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[{ required: true, message: 'Required' }]}
        >
          <AutoCompleteAsync
            entity="product"
            displayLabels={['name']}
            searchFields={'name'}
            placeholder="Search Product"
            onChange={onProductChange}
          />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="Description" />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} onChange={updateQt} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
            addonBefore={money.currency_symbol}
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>
      <Col span={4}>
        <div style={{ padding: '4px 11px', fontWeight: 600, color: '#1e293b', textAlign: 'right' }}>
          {money.amountFormatter({ amount: totalState })}
        </div>
        <Form.Item name={[field.name, 'total']} hidden>
          <InputNumber />
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-25px' }}>
        <DeleteOutlined 
          onClick={() => remove(field.name)} 
          style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '16px' }}
        />
      </div>
    </Row>
  );
}
