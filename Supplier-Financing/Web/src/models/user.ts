import { doFetchUserInfo } from '@/services/user';
import { Effect } from 'dva';
import { Reducer } from 'redux';
import { APIResponse } from '@/types';
import { AppCode } from '@/utils/enum';
import { deleteAllCookies } from '@/utils/cookies';
import { setAuthority } from '@/utils/authority';
import { formatMessage } from 'umi-plugin-locale';

/**
 * 用户类型
 */
export enum UserType {
  ADMIN_BANK = 1,
  BANK = 2,
  COMPANY = 3,
}

/**
 * 输出用户类型对应的 Local Storage 属性值。
 * @param type 用户类型
 */
export function formatUserType(type: UserType): string {
  switch (type) {
    case UserType.ADMIN_BANK:
      return 'admin_bank';
    case UserType.BANK:
      return 'bank';
    case UserType.COMPANY:
      return 'company';
    default:
      return 'guest';
  }
}

/**
 * 输出用户类型对应的文本内容。
 * @param type 用户类型
 */
export function formatUserTypeMessage(type: UserType): string {
  return formatMessage({ id: `account.type.${formatUserType(type)}` });
}

/**
 * 当前用户信息
 */
export interface CurrentUser {
  /**
   * 用户 UID
   */
  uid: number;
  /**
   * 统一社会信用代码
   */
  uscc: string;
  /**
   * 公钥地址
   */
  address: string;
  /**
   * 用户类型
   */
  type: UserType;
}

export interface UserModelState {
  currentUser: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrentUser: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
}

/**
 * 空用户信息
 */
export const emptyUser: CurrentUser = {
  uid: 0,
  uscc: '000000000000000000',
  address: '0x0000000000000000000000000000000000000000',
  type: UserType.COMPANY,
};

const UserModel: UserModelType = {
  namespace: 'user',
  state: {
    currentUser: emptyUser,
  },
  effects: {
    *fetchCurrentUser(_, { call, put }) {
      let response = localStorage.getItem('authority');
      if (!response) {
        return;
      }
      try {
        response = JSON.parse(response);
      } catch (err) {
        // tslint:disable:no-console
        console.log(err);
      }
      if (!Array.isArray(response)) {
        return;
      }
      if (response[0] === 'guest') {
        return;
      }
      const user: APIResponse & { data: CurrentUser } = yield call(doFetchUserInfo);
      if (user.code !== AppCode.SUCCESS) {
        setAuthority('guest');
        deleteAllCookies();
        return;
      }
      yield put({
        type: 'saveCurrentUser',
        payload: user.data,
      });
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
  },
};

export default UserModel;
