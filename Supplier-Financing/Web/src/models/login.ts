import { Effect } from '@/models/connect';
import { doLoginForDevelopment, doLogout } from '@/pages/Login/services';
import { APIResponse } from '@/types';
import { setAuthority } from '@/utils/authority';
import { deleteAllCookies } from '@/utils/cookies';
import { DEVELOPMENT_UID, settings } from '../../config/config';
import { CurrentUser, emptyUser } from './user';

export interface LoginModelState {
  status: boolean | undefined;
}

export interface LoginModelType {
  namespace: 'login';
  state: LoginModelState;
  effects: {
    login: Effect;
    callback: Effect;
    logout: Effect;
  };
  reducers: {};
}

export interface LoginLoginActionType {
  type: 'login/login';
}

export interface LoginCallbackActionType {
  type: 'login/callback';
  payload?: CurrentUser;
}

export interface LoginLogoutActionType {
  type: 'login/logout';
}

const LoginModel: LoginModelType = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *login(action, { call, put }) {
      // 若为本地开发环境
      if (IS_DEV) {
        const uid = DEVELOPMENT_UID;
        const response: APIResponse = yield call(doLoginForDevelopment, { uid });
        window.location.href = response.data;
        return;
      }
      window.location.href = `https://open.weixin.qq.com/connect/qrconnect?appid=${
        settings.wechat.appid
      }&redirect_uri=${encodeURIComponent(
        settings.wechat.redirect_uri,
      )}&response_type=code&scope=snsapi_login#wechat_redirect`;
    },
    callback(action, { call, put }) {
      setAuthority('user');
      window.location.href = '/';
    },
    *logout(_, { call, put }) {
      // 清除服务器 Session
      yield call(doLogout);
      yield put({ type: 'user/saveCurrentUser', payload: emptyUser });
      setAuthority('guest');
      // 清除本地 cookies
      deleteAllCookies();
      // 重定向页面，强制渲染左侧菜单
      window.location.href = '/';
    },
  },
  reducers: {},
};

export default LoginModel;
