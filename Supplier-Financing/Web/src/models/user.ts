import {
  doFetchMoneyAmountLimit,
  doFetchTransactionHistory,
  doSubmitCertification,
  doTopUp,
  ResponseFetchMoneyAmountLimit,
  ResponseFetchTransactionHistory,
  ResponseTopUp,
} from '@/pages/Account/services';
import { queryCurrentUser } from '@/services/user';
import { APIResponse } from '@/types';
import { format } from '@/utils/date';
import { AppCode } from '@/utils/enum';
import { message } from 'antd';
import { Effect } from 'dva';
import { Reducer } from 'redux';

/**
 * 审核资料图片类型
 */
export enum UPLOAD_TYPE {
  LICENSE = 0,
  IDCARD_FRONT = 1,
  IDCARD_BACK = 2,
}

/**
 * 审核状态
 */
export enum CERTIFICATION_STATE {
  DEFAULT = 0,
  LOADING = 1,
  SUCCESS = 2,
  FAILURE = -1,
}

/**
 * 交易记录类型
 */
export enum HISTORY_TYPE {
  // 发布职位
  PUBLISH = 0,
  // 充值
  TOPUP = 1,
}

export interface CurrentUser {
  uid?: number;
  avatar?: string;
  nickname?: string;
  balance?: number;
  business_certification?: CERTIFICATION_STATE;
  certification?: {
    /**
     * 公司名称
     */
    company: string;
    /**
     * 姓名
     */
    name: string;
    /**
     * 电话
     */
    phone: string;
    /**
     * 微信
     */
    wechat: string;
    /**
     * 邮箱
     */
    email?: string;
    /**
     * 营业执照
     */
    license: string;
    /**
     * 营业执照注册号
     */
    license_no: string;
    /**
     * 身份证号码
     */
    idcard_no: string;
    /**
     * 身份证正面
     */
    idcard_front: string;
    /**
     * 身份证反面
     */
    idcard_back: string;
  };
}

export interface UserModelState {
  currentUser: CurrentUser;
  codeUrl: string;
  showModal: boolean;
  transactions: TransactionType[];
  topup_min_amount: number;
}

export interface TransactionType {
  id: number;
  amount: number;
  type: HISTORY_TYPE;
  job_id?: number;
  timestamp: string;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrentUser: Effect;
    refreshCurrentUser: Effect;
    submitCertification: Effect;
    topup: Effect;
    fetchTransactionHistory: Effect;
    fetchTopUpMinAmount: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    savePayModal: Reducer<UserModelState>;
    saveTransactions: Reducer<UserModelState>;
    saveTopUpMinAmount: Reducer<UserModelState>;
  };
}

export interface SubmitCertificationAction {
  type: 'user/submitCertification';
  payload?: any;
}

export interface UserTopUpAction {
  type: 'user/topup';
  payload?: {
    amount: number;
  };
}

/**
 * 获取用户交易记录
 */
export interface UserFetchTransactionHistoryAction {
  type: 'user/fetchTransactionHistory';
}

/**
 * 获取充值最低金额限制
 */
export interface UserFetchTopUpMinAmountAction {
  type: 'user/fetchTopUpMinAmount';
}

export const emptyUser: CurrentUser = {
  uid: 0,
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  nickname: '',
  balance: 0,
  business_certification: 0,
  certification: {
    company: '广州市早知科技有限公司',
    name: '早知招聘',
    phone: '12345678900',
    wechat: 'ZaoZhi_Business',
    email: 'zaozhi@zaozhi.com',
    license: '',
    license_no: '',
    idcard_no: '',
    idcard_front: '',
    idcard_back: '',
  },
};

const UserModel: UserModelType = {
  namespace: 'user',
  state: {
    currentUser: emptyUser,
    codeUrl: '',
    showModal: false,
    transactions: [],
    topup_min_amount: 100,
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
      let user;
      user = yield call(queryCurrentUser);
      yield put({
        type: 'saveCurrentUser',
        payload: user.data,
      });
    },
    *refreshCurrentUser(action, { call, put }) {
      const res: APIResponse = yield call(queryCurrentUser);
      if (res.code !== 200) {
        message.error('获取商户用户信息失败，请重试。');
        return;
      }
      const { data } = res;
      // 若存在 callback 则执行
      if (action.callback) {
        action.callback(data);
      }
      yield put({
        type: 'saveCurrentUser',
        payload: data,
      });
    },
    *submitCertification(action: SubmitCertificationAction, { call, put, select }) {
      const response: APIResponse = yield call(doSubmitCertification, action.payload);
      if (response.code !== 200) {
        message.error('提交商户审核资料失败，请重试。');
        return;
      }
      const currentUser: CurrentUser = yield select(
        ({ user }: { user: UserModelState }) => user.currentUser,
      );
      currentUser.business_certification = CERTIFICATION_STATE.LOADING;
      yield put({
        type: 'saveCurrentUser',
        payload: currentUser,
      });
    },
    *topup(action: UserTopUpAction, { call, put }) {
      const response: ResponseTopUp = yield call(doTopUp, action.payload!.amount);
      if (response.code !== 200) {
        // 显示最低充值金额
        if (response.sub === AppCode.TOPUP_AMOUNT_EXCEPTION) {
          message.error(`最低充值金额为 ${parseInt(response.msg, 10) / 100} 元`);
        }
        message.error('生成支付二维码失败，请重试。');
        return;
      }
      yield put({
        type: 'savePayModal',
        payload: { codeUrl: response.data!.code_url, showModal: true },
      });
    },
    *fetchTransactionHistory(action: UserFetchTransactionHistoryAction, { call, put }) {
      const response: ResponseFetchTransactionHistory = yield call(doFetchTransactionHistory);
      if (response.code !== 200) {
        message.error('获取用户交易记录失败，请重试。');
        return;
      }
      let data = response.data;
      // 根据时间排序
      data = data.sort((a, b) => {
        return new Date(a.timestamp) <= new Date(b.timestamp) ? 1 : -1;
      });
      // 格式化时间输出
      for (let i = 0; i < data.length; i++) {
        data[i].timestamp = format(new Date(data[i].timestamp), 'yyyy-MM-dd HH:mm:ss');
      }
      yield put({ type: 'saveTransactions', payload: data });
    },
    *fetchTopUpMinAmount(action: UserFetchTopUpMinAmountAction, { call, put }) {
      const response: ResponseFetchMoneyAmountLimit = yield call(doFetchMoneyAmountLimit);
      if (response.code !== 200) {
        message.error('获取金额限制失败。');
        return;
      }
      yield put({
        type: 'saveTopUpMinAmount',
        payload: response.data.business_topup_min_amount,
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
    savePayModal(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    saveTransactions(state, action) {
      return {
        ...state,
        transactions: action.payload,
      };
    },
    saveTopUpMinAmount(state, { payload }) {
      return {
        ...state,
        topup_min_amount: payload,
      };
    },
  },
};

export default UserModel;
