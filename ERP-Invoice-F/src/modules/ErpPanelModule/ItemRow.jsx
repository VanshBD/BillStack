import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, Select, Tooltip, Space } from 'antd';
import { DeleteOutlined, TagOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';

export default function ItemRow({ field, remove, current = null, taxOptions = [], onTotalsChange }) {
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [localTaxRate, setLocalTaxRate] = useState(0);
  const [lineTotal, setLineTotal] = useState(0);
  const [lineTax, setLineTax] = useState(0);

  const money = useMoney();
  const form = Form.useFormInstance();

  // Restore values from current (edit mode)
  useEffect(() => {
    if (!current) return;
    const { items } = current;
    const item = items?.[field.fieldKey];
    if (item) {
      setQuantity(item.quantity || 1);
      setPrice(item.price || 0);
      setLocalTaxRate(item.taxRate || 0);
    }
  }, [current, field.fieldKey]);

  // Recalculate whenever price, quantity, or taxRate changes
  useEffect(() => {
    const total = calculate.multiply(price || 0, quantity || 0);
    const tax = calculate.multiply(total, (localTaxRate || 0) / 100);
    setLineTotal(total);
    setLineTax(tax);

    // Sync back into form
    if (!form) return;
    const items = form.getFieldValue('items') || [];
    if (items[field.name] !== undefined) {
      items[field.name] = {
        ...items[field.name],
        total: total,
        taxAmount: tax,
        taxRate: localTaxRate,
      };
      form.setFieldsValue({ items });
    }

    // Notify parent form to recalculate invoice/quote totals & breakdown
    if (onTotalsChange) onTotalsChange();
  }, [price, quantity, localTaxRate, field.name, form]);

  // When a product is selected from the autocomplete — auto-fill fields
  const onProductChange = (value, option) => {
    if (!option || !form) return;
    const items = form.getFieldValue('items') || [];
    if (items[field.name] !== undefined) {
      const newTaxRate = option.taxCategory?.taxValue || 0;
      const newTaxCategoryId = option.taxCategory?._id || null;

      items[field.name] = {
        ...items[field.name],
        itemName: option.name || '',
        price: option.price || 0,
        description: option.description || '',
        taxCategory: newTaxCategoryId,
        taxRate: newTaxRate,
      };
      form.setFieldsValue({ items });
      setPrice(option.price || 0);
      setLocalTaxRate(newTaxRate);
    }
  };

  // When user manually changes the tax category dropdown
  const onTaxChange = (selectedTaxId) => {
    if (!form) return;
    const selectedTax = taxOptions.find(t => t._id === selectedTaxId);
    const newRate = selectedTax ? selectedTax.taxValue : 0;
    setLocalTaxRate(newRate);

    const items = form.getFieldValue('items') || [];
    if (items[field.name] !== undefined) {
      items[field.name] = {
        ...items[field.name],
        taxCategory: selectedTaxId || null,
        taxRate: newRate,
      };
      form.setFieldsValue({ items });
    }
  };

  return (
    <Row gutter={[8, 8]} className="invoice-item-row" align="middle" style={{ position: 'relative', marginBottom: 2 }}>

      {/* Product / Item Name — col 6 */}
      <Col span={6}>
        <Form.Item name={[field.name, 'itemName']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
          <AutoCompleteAsync
            entity="product"
            displayLabels={['name']}
            searchFields="name"
            placeholder="Search Product"
            onChange={onProductChange}
          />
        </Form.Item>
      </Col>

      {/* Description — col 5 */}
      <Col span={5}>
        <Form.Item name={[field.name, 'description']} style={{ marginBottom: 0 }}>
          <Input placeholder="Description" size="small" />
        </Form.Item>
      </Col>

      {/* Qty — col 2 */}
      <Col span={2}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true, message: 'Qty' }]} style={{ marginBottom: 0 }}>
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            size="small"
            onChange={(v) => setQuantity(v || 0)}
          />
        </Form.Item>
      </Col>

      {/* Price — col 3, using Space.Compact (addonBefore deprecated in antd v5) */}
      <Col span={3}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true, message: 'Price' }]} style={{ marginBottom: 0 }}>
          <Space.Compact style={{ width: '100%' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '0 7px',
              background: '#fafafa', border: '1px solid #d9d9d9', borderRight: 'none',
              borderRadius: '4px 0 0 4px', fontSize: '12px', color: '#595959', whiteSpace: 'nowrap',
            }}>
              {money.currency_symbol}
            </span>
            <InputNumber
              className="moneyInput"
              onChange={(v) => setPrice(v || 0)}
              min={0}
              controls={false}
              size="small"
              style={{ width: '100%', borderRadius: '0 4px 4px 0' }}
            />
          </Space.Compact>
        </Form.Item>
      </Col>

      {/* Tax Category — col 4 */}
      <Col span={4}>
        <Tooltip title="Tax auto-filled from product. Override if needed.">
          <Form.Item name={[field.name, 'taxCategory']} style={{ marginBottom: 0 }}>
            <Select
              placeholder={<span><TagOutlined /> Tax</span>}
              onChange={onTaxChange}
              allowClear
              onClear={() => onTaxChange(null)}
              size="small"
              style={{ width: '100%' }}
              optionFilterProp="label"
            >
              {taxOptions.map(tax => (
                <Select.Option key={tax._id} value={tax._id} label={`${tax.taxName} ${tax.taxValue}%`}>
                  {tax.taxName} {tax.taxValue}%
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Tooltip>
        {/* Hidden fields submitted with the form */}
        <Form.Item name={[field.name, 'taxRate']} hidden><InputNumber /></Form.Item>
        <Form.Item name={[field.name, 'taxAmount']} hidden><InputNumber /></Form.Item>
      </Col>

      {/* Line Total — col 4 */}
      <Col span={4} style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
          {money.amountFormatter({ amount: lineTotal })}
        </div>
        {localTaxRate > 0 && (
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
            +Tax: {money.amountFormatter({ amount: lineTax })}
          </div>
        )}
        <Form.Item name={[field.name, 'total']} hidden><InputNumber /></Form.Item>
      </Col>

      {/* Delete button */}
      <div style={{ position: 'absolute', right: '-28px', top: '8px' }}>
        <DeleteOutlined
          onClick={() => remove(field.name)}
          style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '16px' }}
        />
      </div>
    </Row>
  );
}
