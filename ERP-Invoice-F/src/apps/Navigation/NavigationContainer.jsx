import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu, Modal } from 'antd';

import { useAppContext } from '@/context/appContext';

import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.png';
import logoText from '@/style/images/logo-text.png';

import useResponsive from '@/hooks/useResponsive';
import usePwaInstall from '@/hooks/usePwaInstall';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  ProductFilled,
  BankOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false, onMenuClick }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();
  const { triggerInstall } = usePwaInstall();

  const handleInstallApp = async () => {
    if (onMenuClick) onMenuClick();
    const { nativePromptShown } = await triggerInstall();
    if (!nativePromptShown) {
      Modal.info({
        title: '📱 Install BillStack App',
        content: (
          <div style={{ fontSize: '14px', lineHeight: '1.6', paddingTop: '8px' }}>
            <p style={{ marginBottom: '10px' }}>
              <strong>iOS (Safari):</strong> Tap the <strong>Share</strong> button <span style={{ fontSize: '16px' }}>⎋</span>, then scroll down and select <strong>"Add to Home Screen"</strong> <span style={{ fontSize: '16px' }}>➕</span>.
            </p>
            <p style={{ marginBottom: '0' }}>
              <strong>Android (Chrome/Edge):</strong> Tap the browser menu <span style={{ fontSize: '16px' }}>⋮</span> and select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
            </p>
          </div>
        ),
        okText: 'Got It!',
      });
    }
  };

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>{translate('customers')}</Link>,
    },
    {
      key: 'product',
      icon: <ProductFilled />,
      label: <Link to={'/product'}>{translate('product')}</Link>,
    },
    {
      key: 'invoice',
      icon: <ContainerOutlined />,
      label: <Link to={'/invoice'}>{translate('invoices')}</Link>,
    },
    {
      key: 'quote',
      icon: <FileSyncOutlined />,
      label: <Link to={'/quote'}>{translate('quote')}</Link>,
    },
    {
      key: 'payment',
      icon: <CreditCardOutlined />,
      label: <Link to={'/payment'}>{translate('payments')}</Link>,
    },

    {
      key: 'paymentMode',
      label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
      icon: <WalletOutlined />,
    },
    {
      key: 'taxes',
      label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
      icon: <ShopOutlined />,
    },
    {
      key: 'generalSettings',
      label: <Link to={'/settings'}>{translate('settings')}</Link>,
      icon: <SettingOutlined />,
    },
    {
      key: 'about',
      label: <Link to={'/about'}>{translate('about')}</Link>,
      icon: <ReconciliationOutlined />,
    },
    {
      key: 'terms',
      label: <Link to={'/terms-conditions'}>{translate('terms_and_conditions')}</Link>,
      icon: <FileTextOutlined />,
    },
    {
      key: 'bankAccounts',
      label: <Link to={'/bank-accounts'}>{translate('bank_accounts')}</Link>,
      icon: <BankOutlined />,
    },
    {
      key: 'installApp',
      icon: <DownloadOutlined style={{ color: '#1890ff', fontWeight: 'bold' }} />,
      label: (
        <span onClick={handleInstallApp} style={{ color: '#1890ff', fontWeight: 600 }}>
          {translate('Install App') || 'Install App'}
        </span>
      ),
    },
  ];

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);
  const onCollapse = () => {
    navMenu.collapse();
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        className="logo"
        onClick={() => {
          if (onMenuClick) onMenuClick();
          navigate('/');
        }}
        style={{
          cursor: 'pointer',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #edf0f5',
          flexShrink: 0,
        }}
      >
        <img src={logoIcon} alt="Logo" style={{ marginLeft: '-5px', height: '36px' }} />

        {!showLogoApp && (
          <img
            src={logoText}
            alt="Logo"
            style={{
              marginTop: '3px',
              marginLeft: '10px',
              height: '32px',
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: '10px' }}>
        <Menu
          items={items}
          mode="inline"
          theme={'light'}
          selectedKeys={[currentPath]}
          onClick={() => {
            if (onMenuClick) onMenuClick();
          }}
          style={{
            width: '100%',
            borderRight: 0,
          }}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="navigation-mobile"
        style={{
          height: '100%',
          overflowY: 'auto',
          background: '#ffffff',
        }}
      >
        {sidebarContent}
      </div>
    );
  }

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 100,
        background: '#ffffff',
        borderRight: '1px solid #edf0f5',
      }}
      theme={'light'}
    >
      {sidebarContent}
    </Sider>
  );
}

export function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 0, padding: '0 12px' }}
      >
        <MenuOutlined style={{ fontSize: 20 }} />
      </Button>
      <Drawer
        width={250}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar collapsible={false} isMobile={true} onMenuClick={onClose} />
      </Drawer>
    </>
  );
}
