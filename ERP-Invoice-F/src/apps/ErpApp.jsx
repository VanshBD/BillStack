import { useLayoutEffect } from 'react';
import { useEffect } from 'react';
import { selectAppSettings } from '@/redux/settings/selectors';
import { useDispatch, useSelector } from 'react-redux';

import { Layout } from 'antd';

import { useAppContext } from '@/context/appContext';

import Navigation from '@/apps/Navigation/NavigationContainer';

import HeaderContent from '@/apps/Header/HeaderContainer';
import PageLoader from '@/components/PageLoader';

import { settingsAction } from '@/redux/settings/actions';

import { selectSettings } from '@/redux/settings/selectors';

import AppRouter from '@/router/AppRouter';

import useResponsive from '@/hooks/useResponsive';

import storePersist from '@/redux/storePersist';

export default function ErpCrmApp() {
  const { Content } = Layout;

  // const { state: stateApp, appContextAction } = useAppContext();
  // // const { app } = appContextAction;
  // const { isNavMenuClose, currentApp } = stateApp;

  const { isMobile } = useResponsive();

  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);

  // const appSettings = useSelector(selectAppSettings);

  const { isSuccess: settingIsloaded } = useSelector(selectSettings);

  // useEffect(() => {
  //   const { loadDefaultLang } = storePersist.get('firstVisit');
  //   if (appSettings.bizinvo_app_language && !loadDefaultLang) {
  //     window.localStorage.setItem('firstVisit', JSON.stringify({ loadDefaultLang: true }));
  //   }
  // }, [appSettings]);

  if (settingIsloaded)
    return isMobile ? (
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <HeaderContent />
        <Content
          style={{
            margin: '10px auto 20px',
            overflow: 'initial',
            width: '100%',
            padding: '0 12px',
            maxWidth: 'none',
          }}
        >
          <AppRouter />
        </Content>
      </Layout>
    ) : (
      <Layout hasSider style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navigation />
        <Layout style={{ minWidth: 0, background: '#f8fafc' }}>
          <HeaderContent />
          <Content
            style={{
              margin: '20px auto 30px',
              overflow: 'initial',
              width: '100%',
              padding: '0 30px',
              maxWidth: 1400,
            }}
          >
            <AppRouter />
          </Content>
        </Layout>
      </Layout>
    );
  else return <PageLoader />;
}
