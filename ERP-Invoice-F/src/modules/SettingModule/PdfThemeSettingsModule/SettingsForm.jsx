import { Form, Input, Switch, Select, Space } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const fontFamilies = [
  'sans-serif',
  'serif',
  'Arial, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Tahoma, sans-serif',
  'Verdana, sans-serif',
];

const formItems = [
  { settingKey: 'pdf_invoice_title',              valueType: 'string',  label: 'Invoice Title' },
  { settingKey: 'pdf_primary_color',              valueType: 'color',   label: 'Primary Color' },
  { settingKey: 'pdf_secondary_color',            valueType: 'color',   label: 'Secondary Color' },
  { settingKey: 'pdf_accent_color',               valueType: 'color',   label: 'Accent Color' },
  { settingKey: 'pdf_header_bg_color',            valueType: 'color',   label: 'Header Background Color' },
  { settingKey: 'pdf_table_border_color',         valueType: 'color',   label: 'Table Border Color' },
  { settingKey: 'pdf_font_size',                  valueType: 'string',  label: 'Font Size (px)' },
  { settingKey: 'pdf_font_family',                valueType: 'font',    label: 'Font Family' },
  { settingKey: 'pdf_show_hsn_code',              valueType: 'boolean', label: 'Show HSN Code Column' },
  { settingKey: 'pdf_show_ship_to',               valueType: 'boolean', label: 'Show Ship To Party' },
  { settingKey: 'pdf_show_transport_details',     valueType: 'boolean', label: 'Show Transport Details' },
  { settingKey: 'pdf_show_authorized_signatory',  valueType: 'boolean', label: 'Show Authorised Signatory' },
  { settingKey: 'pdf_authorized_signatory_label', valueType: 'string',  label: 'Signatory Label' },
  { settingKey: 'pdf_show_amount_in_words',       valueType: 'boolean', label: 'Show Amount in Words' },
  { settingKey: 'pdf_show_reverse_charge',        valueType: 'boolean', label: 'Show Reverse Charge Row' },
];

// Ensures value is always a valid #rrggbb string for input[type=color]
function toHex(val) {
  if (!val || typeof val !== 'string') return '#000000';
  const trimmed = val.trim();
  // already valid 6-digit hex
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  // 3-digit shorthand → expand
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#000000';
}

// Color picker + hex text input paired together
function ColorInput({ value, onChange }) {
  const safeHex = toHex(value);

  const handlePickerChange = (e) => {
    onChange(e.target.value);
  };

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <input
        type="color"
        value={safeHex}
        onChange={handlePickerChange}
        style={{
          width: 44,
          height: 32,
          padding: 2,
          border: '1px solid #d9d9d9',
          borderRight: 'none',
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          background: 'none',
        }}
      />
      <Input
        value={value || ''}
        onChange={handleTextChange}
        placeholder="#rrggbb"
        style={{ borderRadius: '0 6px 6px 0' }}
        maxLength={7}
      />
    </Space.Compact>
  );
}

export default function PdfThemeSettingsForm() {
  const translate = useLanguage();

  return (
    <div>
      {formItems.map((item) => (
        <Form.Item
          key={item.settingKey}
          label={translate(item.label)}
          name={item.settingKey}
          valuePropName={item.valueType === 'boolean' ? 'checked' : 'value'}
        >
          {item.valueType === 'string' && <Input autoComplete="off" />}

          {item.valueType === 'color' && <ColorInput />}

          {item.valueType === 'font' && (
            <Select
              style={{ width: '100%' }}
              options={fontFamilies.map((f) => ({
                label: <span style={{ fontFamily: f }}>{f}</span>,
                value: f,
              }))}
            />
          )}

          {item.valueType === 'boolean' && (
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          )}
        </Form.Item>
      ))}
    </div>
  );
}
