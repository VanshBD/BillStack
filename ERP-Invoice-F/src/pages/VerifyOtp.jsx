import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { verifyOtp } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import useLanguage from '@/locale/useLanguage';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const VerifyOtp = () => {
  const translate = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectAuth);
  
  // Get email from location state (passed from ForgetPassword)
  const email = location.state?.email;

  const onFinish = async (values) => {
    const data = await dispatch(
      verifyOtp({
        otpData: {
          email,
          otp: values.otp,
        },
      })
    );
    if (data?.success) {
      const { userId, resetToken } = data.result;
      navigate(`/resetpassword/${userId}/${resetToken}`);
    }
  };

  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          name="verify_otp"
          className="login-form"
          onFinish={onFinish}
        >
          <p>{translate('Please enter the 6-digit OTP sent to')} <strong>{email}</strong></p>
          <Form.Item
            name="otp"
            rules={[
              {
                required: true,
                message: translate('Please input your OTP!'),
              },
              {
                len: 6,
                message: translate('OTP must be 6 digits!'),
              }
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder={translate('6-digit OTP')}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" size="large">
              {translate('Verify OTP')}
            </Button>
          </Form.Item>
        </Form>
      </Loading>
    );
  };

  if (!email) {
      return (
          <Result
            status="warning"
            title={translate('Invalid Session')}
            subTitle={translate('Please request a new password reset OTP.')}
            extra={
              <Button type="primary" onClick={() => navigate('/forgetpassword')}>
                {translate('Go to Forget Password')}
              </Button>
            }
          />
      )
  }

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Verify OTP" />;
};

export default VerifyOtp;
