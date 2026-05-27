import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button } from 'antd';

import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

export default function Register() {
    const translate = useLanguage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.firstName,
                surname: values.lastName,
                email: values.email,
                password: values.password,
            };

            const response = await request.post({ entity: '/admin/create', jsonData: payload });

            if (response.status === 200) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const FormContainer = () => {
        return (
            <Loading isLoading={loading}>
                <Form
                    layout="vertical"
                    form={form}
                    name="register"
                    className="login-form"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label={translate('First Name')}
                        name="firstName"
                        rules={[{ required: true, message: 'Please enter your first name' }]}
                    >
                        <Input autoComplete="given-name" />
                    </Form.Item>
                    <Form.Item
                        label={translate('Surname')}
                        name="lastName"
                        rules={[{ required: true, message: 'Please enter your surname' }]}
                    >
                        <Input autoComplete="family-name" />
                    </Form.Item>
                    <Form.Item
                        label={translate('Email')}
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input autoComplete="email" />
                    </Form.Item>
                    <Form.Item
                        label={translate('Password')}
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            loading={loading}
                            size="large"
                        >
                            {translate('Create Account')}
                        </Button>
                    </Form.Item>
                    <Form.Item style={{ textAlign: "center" }}>
                        {translate('Or')}{' '}
                    </Form.Item>
                    <Form.Item style={{ textAlign: "center" }}>
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                        >
                            {translate('already have account Login')}
                        </a>
                    </Form.Item>
                </Form>
            </Loading>
        );
    };

    return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign up" isForRegistre />;
}
