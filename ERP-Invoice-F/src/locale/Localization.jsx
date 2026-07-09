import { ConfigProvider, App } from 'antd';
import { useEffect } from 'react';
import { initNotifyService } from '@/request/notifyService';

function NotifyServiceInitializer() {
  const { notification } = App.useApp();
  useEffect(() => {
    initNotifyService(notification);
  }, [notification]);
  return null;
}

export default function Localization({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#339393',
          colorLink: '#1640D6',
          borderRadius: 0,
        },
      }}
    >
      <App>
        <NotifyServiceInitializer />
        {children}
      </App>
    </ConfigProvider>
  );
}
