import notify from './notifyService';
import codeMessage from './codeMessage';

import storePersist from '@/redux/storePersist';

const errorHandler = (error) => {
  if (!navigator.onLine) {
    notify.error({
      message: 'No internet connection',
      description: 'Cannot connect to the Internet, Check your internet network',
      duration: 15,
    });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const { response } = error;

  if (!response) {
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  // JWT expired → force logout
  if (response.data && response.data.jwtExpired) {
    const result = storePersist.get('auth');
    const jsonFile = storePersist.get('isLogout');
    const { isLogout } = (jsonFile) || {};
    storePersist.remove('auth');
    storePersist.remove('isLogout');
    if (result || isLogout) {
      window.location.href = '/logout';
    }
  }

  if (response && response.status) {
    const message = (response.data && response.data.message) || codeMessage[response.status];

    notify.error({
      message: `Request error ${response.status}`,
      description: message,
      duration: 6,
    });

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      storePersist.remove('auth');
      storePersist.remove('isLogout');
      window.location.href = '/logout';
    } else {
      return response.data;
    }
  } else {
    if (navigator.onLine) {
      notify.error({
        message: 'Problem connecting to server',
        description: 'Cannot connect to the server, Try again later',
        duration: 15,
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Contact your Account administrator',
      };
    } else {
      notify.error({
        message: 'No internet connection',
        description: 'Cannot connect to the Internet, Check your internet network',
        duration: 15,
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Check your internet network',
      };
    }
  }
};

export default errorHandler;
