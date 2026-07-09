/**
 * Global notification service.
 *
 * Ant Design v5 discourages using static notification calls outside components.
 * This module provides a thin wrapper:
 *  - Inside React components: use the `App.useApp()` hook directly.
 *  - Outside components (request handlers): use this service which is
 *    initialized once by <NotifyServiceInitializer /> mounted at app root.
 */

let _notify = null;

export const initNotifyService = (notificationApi) => {
  _notify = notificationApi;
};

const notify = {
  success: (config) => _notify ? _notify.success(config) : console.log('[notify.success]', config),
  error: (config)   => _notify ? _notify.error(config)   : console.warn('[notify.error]', config),
  warning: (config) => _notify ? _notify.warning(config) : console.warn('[notify.warning]', config),
  info: (config)    => _notify ? _notify.info(config)    : console.log('[notify.info]', config),
};

export default notify;
