import { Form, InputNumber, Space } from 'antd';
import { useMoney } from '@/settings';

export default function MoneyInputFormItem({ updatePrice, value = 0, readOnly = false }) {
  const { amountFormatter, currency_symbol, currency_position, cent_precision, currency_code } =
    useMoney();

  return (
    <Form.Item>
      <Space.Compact style={{ width: '100%' }}>
        {currency_position === 'before' && (
          <div className="ant-input-group-addon" style={{ display: 'flex', alignItems: 'center' }}>
            {currency_symbol}
          </div>
        )}
        <InputNumber
          readOnly={readOnly}
          className="moneyInput"
          onChange={updatePrice}
          precision={cent_precision ? cent_precision : 2}
          value={amountFormatter({ amount: value, currency_code: currency_code })}
          controls={false}
          style={{ width: '100%' }}
          formatter={(value) => amountFormatter({ amount: value, currency_code })}
        />
        {currency_position === 'after' && (
          <div className="ant-input-group-addon" style={{ display: 'flex', alignItems: 'center' }}>
            {currency_symbol}
          </div>
        )}
      </Space.Compact>
    </Form.Item>
  );
}
