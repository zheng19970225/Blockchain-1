import { delay } from '@/utils/utils';
import { message } from 'antd';
import { Effect, Subscription } from 'dva';
import { routerRedux } from 'dva/router';
import { Reducer } from 'redux';
import { CERTIFICATION_STATE, CurrentUser, UserModelState } from './user';

export interface GlobalModelState {
  collapsed: boolean;
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    certification: Effect;
  };
  reducers: {
    changeLayoutCollapsed: Reducer<GlobalModelState>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',
  state: {
    collapsed: false,
  },
  effects: {
    *certification(action, { select, put, call }) {
      // 这里会造成当用户直接访问黑名单页面时，会重定向至商户资料提交页面，尽管用户可能已通过商户认证
      let currentUser: CurrentUser = yield select(
        ({ user }: { user: UserModelState }) => user.currentUser,
      );
      // 对 uid 进行判断，进行对应的延时，避免在已通过商户认证的情况下，重定向至商户资料提交页面
      if (!currentUser.uid) {
        yield call(delay, 1000);
        currentUser = yield select(({ user }: { user: UserModelState }) => user.currentUser);
      }
      const { business_certification } = currentUser;
      // 当商户审核状态不是成功时，访问黑名单内的页面均被重定向至商户资料提交页面
      if (business_certification !== CERTIFICATION_STATE.SUCCESS) {
        if (business_certification === CERTIFICATION_STATE.LOADING) {
          message.error('资质正在审核当中，请耐心等候。');
        }
        if (business_certification === CERTIFICATION_STATE.DEFAULT) {
          message.error('您未提交任何商户资质审核资料，请提交商户审核资料。');
        }
        if (business_certification === CERTIFICATION_STATE.FAILURE) {
          message.error('很抱歉，您提交的资质未被审核通过，请重新提交商户审核资料。');
        }
        yield put(routerRedux.push('/account/certification'));
        return;
      }
    },
  },
  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const { pathname } = location;
        // 当商户审核状态不是成功时，访问黑名单内的页面均被重定向至商户资料提交页面
        const blacklist = ['job', 'resume', 'topup', 'transaction'];
        for (let i of blacklist) {
          if (pathname.includes(i)) {
            dispatch({ type: 'certification', payload: { pathname } });
            return;
          }
        }
      });
    },
  },
};

export default GlobalModel;
