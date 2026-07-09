import * as actionTypes from './types';
import * as authService from '@/auth';
import { request } from '@/request';
import storePersist from '@/redux/storePersist';

export const login =
  ({ loginData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.login({ loginData });

    if (data.success === true) {
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      const remember = data.result.maxAge ? true : false;
      storePersist.set('auth', auth_state, remember);
      storePersist.remove('isLogout');
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const register =
  ({ registerData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.register({ registerData });

    if (data.success === true) {
      dispatch({
        type: actionTypes.REGISTER_SUCCESS,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const verify =
  ({ userId, emailToken }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.verify({ userId, emailToken });

    if (data.success === true) {
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      const remember = data.result.maxAge ? true : false;
      storePersist.set('auth', auth_state, remember);
      storePersist.remove('isLogout');
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const verifyOtp =
  ({ otpData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.verifyOtp({ otpData });

    if (data.success === true) {
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
      });
      return data;
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const resetPassword =
  ({ resetPasswordData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.resetPassword({ resetPasswordData });

    if (data.success === true) {
      const auth_state = {
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      const remember = data.result.maxAge ? true : false;
      storePersist.set('auth', auth_state, remember);
      storePersist.remove('isLogout');
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const logout = () => async (dispatch) => {
  dispatch({
    type: actionTypes.LOGOUT_SUCCESS,
  });
  const tmpAuth = storePersist.get('auth');
  const tmpSettings = storePersist.get('settings');
  storePersist.remove('auth');
  storePersist.remove('settings');
  storePersist.set('isLogout', { isLogout: true }, true);
  const data = await authService.logout();
  if (data.success === false) {
    const auth_state = {
      current: tmpAuth ? tmpAuth.current : {},
      isLoggedIn: true,
      isLoading: false,
      isSuccess: true,
    };
    storePersist.set('auth', auth_state, tmpAuth && tmpAuth.current && tmpAuth.current.maxAge ? true : false);
    storePersist.set('settings', tmpSettings, true);
    storePersist.remove('isLogout');
    dispatch({
      type: actionTypes.LOGOUT_FAILED,
      payload: data.result,
    });
  } else {
    // on lgout success
  }
};

export const updateProfile =
  ({ entity, jsonData }) =>
  async (dispatch) => {
    let data = await request.updateAndUpload({ entity, id: '', jsonData });

    if (data.success === true) {
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: data.result,
      });
      const tmpAuth = storePersist.get('auth') || {};
      const auth_state = {
        ...tmpAuth,
        current: data.result,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      const remember = data.result.maxAge ? true : false;
      storePersist.set('auth', auth_state, remember);
    }
  };

