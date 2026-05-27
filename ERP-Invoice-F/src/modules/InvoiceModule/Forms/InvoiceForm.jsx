import { useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col, Modal, Typography, Space, Tag, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, ShopOutlined, UserOutlined, FileTextOutlined, BankOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import SelectAsync from '@/components/SelectAsync';

import { selectFinanceSettings, selectCompanySettings } from '@/redux/settings/selectors';
import { useDate, useMoney } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { request } from '@/request';
import { countryList } from '@/utils/countryList';
import { list as listBankAccounts } from '@/redux/bankAccount/bankAccountSlice';
import { list as listTerms } from '@/redux/terms/termsSlice';
import { numberToWordsIndian } from '@/utils/numberToWords';

const { Title, Text } = Typography;

export default function InvoiceForm({ subTotal = 0, current = null, form }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  if (last_invoice_number === undefined) {
    return null;
  }

  return <LoadInvoiceForm subTotal={subTotal} current={current} form={form} />;
}

function LoadInvoiceForm({ subTotal = 0, current = null, form }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const money = useMoney();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const companySettings = useSelector(selectCompanySettings);
  
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [taxType, setTaxType] = useState('cgst_sgst'); // 'igst' or 'cgst_sgst'
  const [currentYear] = useState(() => new Date().getFullYear());
  const [lastNumber] = useState(() => last_invoice_number + 1);
  const [clientValue, setClientValue] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isCustomerSubmitting, setIsCustomerSubmitting] = useState(false);
  const [customerForm] = Form.useForm();
  const dispatch = useDispatch();

  const { list: bankAccounts } = useSelector((state) => state.bankAccount);
  const { list: termsList } = useSelector((state) => state.terms);

  useEffect(() => {
    dispatch(listBankAccounts());
    dispatch(listTerms());
  }, [dispatch]);

  // Handle Tax Type Detection (IGST vs CGST/SGST)
  const isInterState = useMemo(() => {
    if (!clientDetails || !companySettings) return false;
    const clientState = clientDetails.state || '';
    const companyState = companySettings.company_state || '';
    return clientState.trim().toLowerCase() !== companyState.trim().toLowerCase();
  }, [clientDetails, companySettings]);

  // Sync taxType automatically on client state code detection
  useEffect(() => {
    setTaxType(isInterState ? 'igst' : 'cgst_sgst');
  }, [isInterState]);

  const handelTaxChange = (value) => {
    setTaxRate(value / 100);
  };

  const handleOpenCustomerModal = () => setIsCustomerModalVisible(true);
  const handleCancelCustomerModal = () => {
    setIsCustomerModalVisible(false);
    customerForm.resetFields();
  };

  const handleTermChange = async (value) => {
    const term = await request.read({ entity: 'termsandconditions', id: value });
    if (term && term.result) {
      form.setFieldsValue({ termsAndConditions: term.result.content });
    }
  };

  const onClientChange = (value, option) => {
    if (option) {
      setClientDetails(option);
      if (form) {
        form.setFieldsValue({ client: value });
      }
    } else {
      setClientDetails(null);
    }
  };

  const handleBankChange = (value) => {
    if (value && bankAccounts) {
      const bank = bankAccounts.find((b) => b._id === value);
      setSelectedBankDetails(bank || null);
    } else {
      setSelectedBankDetails(null);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const values = await customerForm.validateFields();
      setIsCustomerSubmitting(true);
      const created = await request.create({ entity: 'client', jsonData: values });
      setIsCustomerSubmitting(false);
      if (created) {
        setClientValue(created);
        setClientDetails(created);
        setIsCustomerModalVisible(false);
        customerForm.resetFields();
      }
    } catch (error) {
      setIsCustomerSubmitting(false);
    }
  };

  useEffect(() => {
    if (current) {
      const { taxRate: currentTaxRate = 0, client } = current;
      setTaxRate(currentTaxRate / 100);
      if (client) setClientDetails(client);
    }
  }, [current]);

  // Pre-populate bank and terms on edit
  useEffect(() => {
    if (current && bankAccounts && bankAccounts.length > 0) {
      const { selectedBankDetails } = current;
      if (selectedBankDetails && selectedBankDetails.bankAccount) {
        const matchingBank = bankAccounts.find(
          (a) => a.accountNumber === selectedBankDetails.bankAccount
        );
        if (matchingBank) {
          form.setFieldsValue({ selectedBankAccountId: matchingBank._id });
          setSelectedBankDetails(matchingBank);
        }
      }
    }
  }, [current, bankAccounts, form]);

  useEffect(() => {
    if (current && termsList && termsList.length > 0) {
      const { termsAndConditions } = current;
      if (termsAndConditions) {
        const matchingTerm = termsList.find((t) => t.content === termsAndConditions);
        if (matchingTerm) {
          form.setFieldsValue({ selectedTermsId: matchingTerm._id });
        }
      }
    }
  }, [current, termsList, form]);

  useEffect(() => {
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), subTotal);
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate]);

  const addFieldRef = useRef(null);

  useEffect(() => {
    if (addFieldRef.current) {
      addFieldRef.current.click();
    }
  }, []);

  // Set default bank if not set
  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0) {
      const selectedId = form.getFieldValue('selectedBankAccountId');
      if (selectedId) {
        const bank = bankAccounts.find((b) => b._id === selectedId);
        setSelectedBankDetails(bank || null);
      } else {
        const defaultBank = bankAccounts.find(a => a.enabled) || bankAccounts[0];
        if (defaultBank) {
          form.setFieldsValue({ selectedBankAccountId: defaultBank._id });
          setSelectedBankDetails(defaultBank);
        }
      }
    }
  }, [bankAccounts, form]);

  // Set default terms if not set
  useEffect(() => {
    if (termsList && termsList.length > 0 && !form.getFieldValue('selectedTermsId')) {
      const defaultTerm = termsList.find(t => t.isDefault && t.enabled !== false) || termsList.find(t => t.enabled !== false) || termsList[0];
      if (defaultTerm) {
        form.setFieldsValue({ 
          selectedTermsId: defaultTerm._id,
          termsAndConditions: defaultTerm.content
        });
      }
    }
  }, [termsList, form]);

  // Set default tax if not set
  useEffect(() => {
    if (!current) {
      const fetchDefaultTax = async () => {
        try {
          const response = await request.list({ entity: 'taxes' });
          if (response && response.success && response.result) {
            const defaultTax = response.result.find(t => t.isDefault && t.enabled);
            if (defaultTax && !form.getFieldValue('taxRate')) {
              form.setFieldsValue({ taxRate: defaultTax.taxValue });
              setTaxRate(defaultTax.taxValue / 100);
            }
          }
        } catch (error) {
          console.error('Failed to fetch default tax:', error);
        }
      };
      fetchDefaultTax();
    }
  }, [current, form]);

  return (
    <div className="invoice-form-container">
      {/* 1. Header Section: Company Info & Invoice Meta */}
      <div className="invoice-header-section">
        <div className="invoice-client-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px' }}>
              <ShopOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>{companySettings?.company_name || 'My Company'}</Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>{companySettings?.company_address}</Text>
            </div>
          </div>

          <label className="invoice-label">BILL TO</label>
          <Form.Item
            name="client"
            rules={[{ required: true, message: 'Please select a client' }]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={'Add New Client'}
              withRedirect
              urlToRedirect={'/customer'}
              onAddNew={handleOpenCustomerModal}
              value={clientValue}
              onChange={onClientChange}
              placeholder="Search or Select Client"
            />
          </Form.Item>
          {clientDetails && (
            <div style={{ 
              marginTop: '-16px', 
              marginBottom: '20px',
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                  {clientDetails.company || clientDetails.name}
                </Text>
                {clientDetails.gst && (
                  <Tag color="blue" bordered={false} style={{ margin: 0, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                    GST: {clientDetails.gst}
                  </Tag>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '12px' }}>
                {clientDetails.company && clientDetails.name && (
                  <div>
                    <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {translate('Contact Person')}
                    </Text>
                    <Text style={{ fontWeight: 500, color: '#334155' }}>{clientDetails.name}</Text>
                  </div>
                )}
                <div>
                  <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {translate('Contact Details')}
                  </Text>
                  <Text style={{ color: '#334155', display: 'block' }}>{clientDetails.phone}</Text>
                  {clientDetails.email && <Text type="secondary" style={{ fontSize: '11px', color: '#64748b' }}>{clientDetails.email}</Text>}
                </div>
                {clientDetails.address && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {translate('Address')}
                    </Text>
                    <Text style={{ color: '#475569' }}>{clientDetails.address}</Text>
                    {clientDetails.state && (
                      <div style={{ marginTop: '4px' }}>
                        <Tag color="default" style={{ margin: 0, fontSize: '10px' }}>
                          State: {clientDetails.state} {clientDetails.stateCode ? `(${clientDetails.stateCode})` : ''}
                        </Tag>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="invoice-details-info">
          <Row gutter={16}>
            <Col span={14}>
              <label className="invoice-label">INVOICE NO.</label>
              <Form.Item name="number" initialValue={lastNumber} rules={[{ required: true }]}>
                <InputNumber prefix="#" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <label className="invoice-label">YEAR</label>
              <Form.Item name="year" initialValue={currentYear} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <label className="invoice-label">DATE</label>
              <Form.Item name="date" initialValue={dayjs()} rules={[{ required: true, type: 'object' }]}>
                <DatePicker style={{ width: '100%' }} format={dateFormat} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <label className="invoice-label">DUE DATE</label>
              <Form.Item name="expiredDate" rules={[{ required: false, type: 'object' }]}>
                <DatePicker style={{ width: '100%' }} format={dateFormat} />
              </Form.Item>
            </Col>
          </Row>

          <label className="invoice-label">STATUS</label>
          <Form.Item name="status" initialValue={'draft'}>
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'pending', label: 'Pending' },
                { value: 'sent', label: 'Sent' },
              ]}
            />
          </Form.Item>
        </div>
      </div>

      {/* 2. Items Section */}
      <div className="invoice-items-section">
        <Row gutter={[12, 12]} className="invoice-items-header" align="middle">
          <Col span={7}>Item / Product</Col>
          <Col span={6}>Description</Col>
          <Col span={3}>Qty</Col>
          <Col span={4}>Price</Col>
          <Col span={4} style={{ textAlign: 'right' }}>Total</Col>
        </Row>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <ItemRow key={field.key} remove={remove} field={field} current={current}></ItemRow>
              ))}
              <Button
                className="add-item-btn"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addFieldRef}
              >
                Add Line Item
              </Button>
            </>
          )}
        </Form.List>
      </div>

      {/* 3. Footer Section: Notes, Bank & Summary */}
      <div className="invoice-footer-section">
        <div className="invoice-footer-left">
          <label className="invoice-label"><BankOutlined /> {translate('BANK DETAILS')}</label>
          <Form.Item name="selectedBankAccountId">
            <Select placeholder={translate('Select Bank Account')} onChange={handleBankChange} allowClear>
              {bankAccounts?.map((account) => (
                <Select.Option key={account._id} value={account._id}>
                  {account.bankName} - {account.accountNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedBankDetails && (
            <div style={{ 
              marginTop: '-16px', 
              marginBottom: '20px',
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                  {selectedBankDetails.bankName}
                </Text>
                {selectedBankDetails.isDefault && (
                  <Tag color="cyan" bordered={false} style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase' }}>
                    {translate('Default')}
                  </Tag>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '12px' }}>
                <div>
                  <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {translate('Account Holder')}
                  </Text>
                  <Text style={{ fontWeight: 500, color: '#334155' }}>{selectedBankDetails.accountHolderName}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {translate('Account Number')}
                  </Text>
                  <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{selectedBankDetails.accountNumber}</Text>
                </div>
                {selectedBankDetails.branchName && (
                  <div>
                    <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {translate('Branch')}
                    </Text>
                    <Text style={{ color: '#475569' }}>{selectedBankDetails.branchName}</Text>
                  </div>
                )}
                {selectedBankDetails.ifscCode && (
                  <div>
                    <Text type="secondary" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {translate('IFSC Code')}
                    </Text>
                    <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>{selectedBankDetails.ifscCode}</Text>
                  </div>
                )}
              </div>
            </div>
          )}

          <label className="invoice-label"><FileTextOutlined /> TERMS & CONDITIONS</label>
          <Form.Item name="selectedTermsId">
            <Select placeholder="Select Predefined Terms" onChange={handleTermChange} allowClear>
              {termsList?.filter(t => t.enabled !== false)?.map((term) => (
                <Select.Option key={term._id} value={term._id}>
                  {term.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="termsAndConditions">
            <Input.TextArea rows={4} placeholder="Detailed terms and conditions..." style={{ borderRadius: '8px' }} />
          </Form.Item>

          <label className="invoice-label">ADDITIONAL NOTES</label>
          <Form.Item name="notes">
            <Input.TextArea rows={2} placeholder="Any notes for the client..." style={{ borderRadius: '8px' }} />
          </Form.Item>
        </div>

        <div className="invoice-footer-right">
          <div className="summary-item">
            <Text type="secondary">Sub Total</Text>
            <Text strong>{money.amountFormatter({ amount: subTotal })}</Text>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Text strong type="secondary" style={{ fontSize: '12px' }}>TAX RATE & CATEGORY</Text>
              <Radio.Group 
                value={taxType} 
                onChange={(e) => setTaxType(e.target.value)}
                size="small"
                buttonStyle="solid"
              >
                <Radio.Button value="igst">IGST</Radio.Button>
                <Radio.Button value="cgst_sgst">CGST + SGST</Radio.Button>
              </Radio.Group>
            </div>
            <Form.Item name="taxRate" noStyle rules={[{ required: true }]}>
              <SelectAsync
                value={taxRate}
                onChange={handelTaxChange}
                entity={'taxes'}
                outputValue={'taxValue'}
                displayLabels={['taxName']}
                placeholder="Select Tax"
                style={{ width: '100%', marginBottom: '8px' }}
              />
            </Form.Item>
          </div>

          {taxType === 'igst' ? (
            <div className="summary-item">
              <Text type="secondary">Tax (IGST {taxRate * 100}%)</Text>
              <Text strong>{money.amountFormatter({ amount: taxTotal })}</Text>
            </div>
          ) : (
            <>
              <div className="summary-item">
                <Text type="secondary">Tax (CGST {(taxRate * 100) / 2}%)</Text>
                <Text strong>{money.amountFormatter({ amount: taxTotal / 2 })}</Text>
              </div>
              <div className="summary-item" style={{ borderTop: 'none', paddingTop: 0 }}>
                <Text type="secondary">Tax (SGST {(taxRate * 100) / 2}%)</Text>
                <Text strong>{money.amountFormatter({ amount: taxTotal / 2 })}</Text>
              </div>
            </>
          )}

          <div className="summary-item total">
            <Title level={4} style={{ margin: 0 }}>Total</Title>
            <Title level={4} style={{ margin: 0, color: '#3b82f6' }}>{money.amountFormatter({ amount: total })}</Title>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="invoice-label" style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>AMOUNT IN WORDS</label>
            <Text style={{ fontSize: '13px', fontWeight: 500, fontStyle: 'italic', display: 'block' }}>
              {numberToWordsIndian(total)}
            </Text>
          </div>

          <Button type="primary" htmlType="submit" size="large" style={{ marginTop: '24px', height: '50px', borderRadius: '10px', fontSize: '16px', fontWeight: 600 }}>
            Save Invoice
          </Button>
        </div>
      </div>

      {/* Customer Modal */}
      <Modal
        open={isCustomerModalVisible}
        title="Add New Client"
        onOk={handleCreateCustomer}
        confirmLoading={isCustomerSubmitting}
        onCancel={handleCancelCustomerModal}
        destroyOnHidden
      >
        <Form form={customerForm} layout="vertical">
          <Form.Item name="name" label="Client Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Select showSearch options={countryList.map(c => ({ label: translate(c.label), value: c.value }))} />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
