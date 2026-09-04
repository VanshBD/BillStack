import { ErpContextProvider } from '@/context/erp';
import { Layout } from 'antd';
import useResponsive from '@/hooks/useResponsive';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  const { isMobile } = useResponsive();

  return (
    <ErpContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          margin: isMobile ? '15px auto' : '30px auto',
          width: '100%',
          maxWidth: '1100px',
          minHeight: isMobile ? 'auto' : '600px',
          padding: isMobile ? '16px' : undefined,
        }}
      >
        {children}
      </Content>
    </ErpContextProvider>
  );
}
