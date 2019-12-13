import { Subscription } from 'dva';
import { Reducer } from 'redux';

export interface GlobalModelState {
  collapsed: boolean;
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {};
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
  effects: {},
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
      history.listen(location => {});
    },
  },
};

export default GlobalModel;
