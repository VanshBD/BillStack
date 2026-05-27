import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'BillStack Business Manager'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={
        <>
          <p>
            Website : <a href="https://localhost:3000">https://localhost:3000</a>{' '}
          </p>
        </>
      }
    />
  );
};

export default About;
