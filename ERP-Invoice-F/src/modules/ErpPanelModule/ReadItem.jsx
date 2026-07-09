import { useState, useEffect } from 'react';
import { Divider } from 'antd';

import { Button, Row, Col, Descriptions, Statistic, Tag } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
  RetweetOutlined,
  MailOutlined,
} from '@ant-design/icons';

import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';

import { generate as uniqueId } from 'shortid';

import { selectCurrentItem } from '@/redux/erp/selectors';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { useMoney, useDate } from '@/settings';
import useMail from '@/hooks/useMail';
import { useNavigate } from 'react-router-dom';

const Item = ({ item, currentErp }) => {
  const { moneyFormatter } = useMoney();
  const taxRate = item.taxRate || 0;
  const taxAmount = item.taxAmount || (item.total * taxRate / 100);
  const taxType = currentErp.taxType || 'cgst_sgst';

  return (
    <Row gutter={[12, 0]} key={item._id}>
      <Col className="gutter-row" span={9}>
        <p style={{ marginBottom: 5 }}>
          <strong>{item.itemName}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: '12px' }}>{item.description}</p>
      </Col>
      <Col className="gutter-row" span={3}>
        <p style={{ textAlign: 'right' }}>
          {moneyFormatter({ amount: item.price, currency_code: currentErp.currency })}
        </p>
      </Col>
      <Col className="gutter-row" span={2}>
        <p style={{ textAlign: 'right' }}>{item.quantity}</p>
      </Col>
      <Col className="gutter-row" span={5}>
        {taxRate > 0 ? (
          taxType === 'igst' ? (
            <p style={{ textAlign: 'right', fontSize: '12px', color: '#475569' }}>
              IGST {taxRate}%: {moneyFormatter({ amount: taxAmount, currency_code: currentErp.currency })}
            </p>
          ) : (
            <p style={{ textAlign: 'right', fontSize: '12px', color: '#475569' }}>
              CGST {taxRate / 2}% + SGST {taxRate / 2}%: {moneyFormatter({ amount: taxAmount, currency_code: currentErp.currency })}
            </p>
          )
        ) : (
          <p style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>—</p>
        )}
      </Col>
      <Col className="gutter-row" span={5}>
        <p style={{ textAlign: 'right', fontWeight: '700' }}>
          {moneyFormatter({ amount: item.total, currency_code: currentErp.currency })}
        </p>
      </Col>
      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />
    </Row>
  );
};

export default function ReadItem({ config, selectedItem }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { moneyFormatter } = useMoney();
  const { send, isLoading: mailInProgress } = useMail({ entity });

  const { result: currentResult } = useSelector(selectCurrentItem);

  const resetErp = {
    status: '',
    client: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    subTotal: 0,
    taxTotal: 0,
    taxRate: 0,
    total: 0,
    credit: 0,
    number: 0,
    year: 0,
  };

  const [itemslist, setItemsList] = useState([]);
  const [currentErp, setCurrentErp] = useState(selectedItem ?? resetErp);
  const [client, setClient] = useState({});

  useEffect(() => {
    if (currentResult) {
      const { items, invoice, ...others } = currentResult;

      if (items) {
        setItemsList(items);
        setCurrentErp(currentResult);
      } else if (invoice.items) {
        setItemsList(invoice.items);
        setCurrentErp({ ...invoice.items, ...others, ...invoice });
      }
    }
    return () => {
      setItemsList([]);
      setCurrentErp(resetErp);
    };
  }, [currentResult]);

  useEffect(() => {
    if (currentErp?.client) {
      setClient(currentErp.client);
    }
  }, [currentErp]);

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentErp.invoiceDisplayNumber || (currentErp.number + '/' + (currentErp.year || ''))}`}
        ghost={false}
        tags={[
          <span key="status">{currentErp.status && translate(currentErp.status)}</span>,
          currentErp.paymentStatus && (
            <span key="paymentStatus">
              {currentErp.paymentStatus && translate(currentErp.paymentStatus)}
            </span>
          ),
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              window.open(
                `${DOWNLOAD_BASE_URL}${entity}/${entity}-${currentErp._id}.pdf`,
                '_blank'
              );
            }}
            icon={<FilePdfOutlined />}
          >
            {translate('Download PDF')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            loading={mailInProgress}
            onClick={() => {
              send(currentErp._id);
            }}
            icon={<MailOutlined />}
          >
            {translate('Send by Email')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(erp.convert({ entity, id: currentErp._id }));
            }}
            icon={<RetweetOutlined />}
            style={{ display: entity === 'quote' ? 'inline-block' : 'none' }}
          >
            {translate('Convert to Invoice')}
          </Button>,

          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentErp,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentErp._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      >
        <Row>
          <Statistic title="Status" value={currentErp.status} />
          <Statistic
            title={translate('SubTotal')}
            value={moneyFormatter({
              amount: currentErp.subTotal,
              currency_code: currentErp.currency,
            })}
            style={{
              margin: '0 32px',
            }}
          />
          <Statistic
            title={translate('Total')}
            value={moneyFormatter({ amount: currentErp.total, currency_code: currentErp.currency })}
            style={{
              margin: '0 32px',
            }}
          />
          <Statistic
            title={translate('Paid')}
            value={moneyFormatter({
              amount: currentErp.credit,
              currency_code: currentErp.currency,
            })}
            style={{
              margin: '0 32px',
            }}
          />
        </Row>
      </PageHeader>
      <Divider dashed />
      <Descriptions title={`Client : ${currentErp.client.name}`}>
        <Descriptions.Item label={translate('Address')}>{client.address}</Descriptions.Item>
        <Descriptions.Item label={translate('email')}>{client.email}</Descriptions.Item>
        <Descriptions.Item label={translate('Phone')}>{client.phone}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={9}>
          <p><strong>{translate('Product')}</strong></p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p style={{ textAlign: 'right' }}><strong>{translate('Price')}</strong></p>
        </Col>
        <Col className="gutter-row" span={2}>
          <p style={{ textAlign: 'right' }}><strong>{translate('Qty')}</strong></p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p style={{ textAlign: 'right' }}><strong>{translate('Tax')}</strong></p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p style={{ textAlign: 'right' }}><strong>{translate('Total')}</strong></p>
        </Col>
        <Divider />
      </Row>
      {itemslist.map((item) => (
        <Item key={item._id} item={item} currentErp={currentErp}></Item>
      ))}
      <div
        style={{
          width: '360px',
          float: 'right',
          textAlign: 'right',
          fontWeight: '700',
        }}
      >
        <Row gutter={[12, -5]}>
          {/* Sub Total */}
          <Col className="gutter-row" span={12}>
            <p>{translate('Sub Total')} :</p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p>{moneyFormatter({ amount: currentErp.subTotal, currency_code: currentErp.currency })}</p>
          </Col>

          {/* Tax breakdown — per category */}
          {currentErp.taxBreakdown && currentErp.taxBreakdown.length > 0 ? (
            currentErp.taxBreakdown.map((bd, idx) =>
              currentErp.taxType === 'igst' ? (
                <Col key={idx} span={24}>
                  <Row gutter={[12, -5]}>
                    <Col span={12}>
                      <p style={{ fontWeight: 400, color: '#475569', fontSize: '13px' }}>
                        IGST {bd.taxRate}% ({bd.taxCategoryName}) :
                      </p>
                    </Col>
                    <Col span={12}>
                      <p style={{ fontWeight: 400, color: '#475569', fontSize: '13px' }}>
                        {moneyFormatter({ amount: bd.igstAmount, currency_code: currentErp.currency })}
                      </p>
                    </Col>
                  </Row>
                </Col>
              ) : (
                <Col key={idx} span={24}>
                  <Row gutter={[12, -5]}>
                    <Col span={12}>
                      <p style={{ fontWeight: 400, color: '#475569', fontSize: '13px' }}>
                        CGST {bd.taxRate / 2}% ({bd.taxCategoryName}) :
                      </p>
                    </Col>
                    <Col span={12}>
                      <p style={{ fontWeight: 400, color: '#475569', fontSize: '13px' }}>
                        {moneyFormatter({ amount: bd.cgstAmount, currency_code: currentErp.currency })}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p style={{ fontWeight: 400, color: '#475569', fontSize: '13px' }}>
                        SGST {bd.taxRate / 2}% ({bd.taxCategoryName}) :
                      </p>
                    </Col>
                    <Col span={12}>
                      <p style={{ fontWeight: 400, color: '#475569', fontSize: '13px' }}>
                        {moneyFormatter({ amount: bd.sgstAmount, currency_code: currentErp.currency })}
                      </p>
                    </Col>
                  </Row>
                </Col>
              )
            )
          ) : (
            /* Legacy fallback — old invoices without taxBreakdown */
            <>
              <Col className="gutter-row" span={12}>
                <p style={{ fontWeight: 400, color: '#475569' }}>
                  {translate('Tax Total')} ({currentErp.taxRate || 0}%) :
                </p>
              </Col>
              <Col className="gutter-row" span={12}>
                <p style={{ fontWeight: 400, color: '#475569' }}>
                  {moneyFormatter({ amount: currentErp.taxTotal, currency_code: currentErp.currency })}
                </p>
              </Col>
            </>
          )}

          {/* Grand Total */}
          <Col className="gutter-row" span={12}>
            <p style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
              {translate('Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={12}>
            <p style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px', color: '#2563eb' }}>
              {moneyFormatter({ amount: currentErp.total, currency_code: currentErp.currency })}
            </p>
          </Col>
        </Row>
      </div>
      <div style={{ clear: 'both' }} />
      <Divider />
      <Row gutter={[12, 12]}>
        <Col span={12}>
          <p><strong>{translate('Terms & Conditions')}</strong></p>
          <p style={{ whiteSpace: 'pre-line' }}>{currentErp.termsAndConditions}</p>
        </Col>
        <Col span={12}>
          {currentErp.selectedBankDetails && (
            <>
              <p><strong>{translate('Bank Details')}</strong></p>
              <p>{translate('Bank Name')}: {currentErp.selectedBankDetails.bankName}</p>
              <p>{translate('Account Number')}: {currentErp.selectedBankDetails.bankAccount}</p>
              <p>{translate('Account Holder')}: {currentErp.selectedBankDetails.accountHolderName}</p>
              <p>{translate('Branch')}: {currentErp.selectedBankDetails.bankBranch}</p>
              <p>{translate('IFSC')}: {currentErp.selectedBankDetails.bankIfsc}</p>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}
