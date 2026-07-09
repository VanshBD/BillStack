import notify from './notifyService';
import codeMessage from './codeMessage';

const successHandler = (response, options = { notifyOnSuccess: false, notifyOnFailed: true }) => {
  const { data } = response;

  if (data && data.success === true) {
    if (options.notifyOnSuccess) {
      const message = data.message || codeMessage[response.status];
      notify.success({
        message: 'Request success',
        description: message,
        duration: 2,
      });
    }
  } else {
    if (options.notifyOnFailed) {
      const message = (data && data.message) || codeMessage[response.status];
      notify.error({
        message: `Request error ${response.status}`,
        description: message,
        duration: 4,
      });
    }
  }
};

export default successHandler;
