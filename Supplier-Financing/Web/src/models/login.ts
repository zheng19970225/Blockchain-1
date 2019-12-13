import { Effect } from '@/models/connect';
import { doLogin, doLogout, ResponseLogin } from '@/pages/Login/services';
import { setAuthority } from '@/utils/authority';
import { deleteAllCookies } from '@/utils/cookies';
import { formatAppCode } from '@/utils/enum';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import { emptyUser, formatUserType } from './user';

export interface LoginModelState {
  status: boolean | undefined;
}

export interface LoginModelType {
  namespace: 'login';
  state: LoginModelState;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {};
}

export interface LoginLoginActionType {
  type: 'login/login';
  payload?: {
    uscc: string;
    password: string;
  };
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
    *login(action: LoginLoginActionType, { call, put }) {
      const res: ResponseLogin = yield call(doLogin, action.payload!);
      if (!res || res.code !== 200) {
        message.error(formatAppCode(res.sub));
        return;
      }
      message.success(formatMessage({ id: 'login.success' }));
      setAuthority(formatUserType(res.data.type));
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
