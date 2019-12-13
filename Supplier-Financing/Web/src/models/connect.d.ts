import { Route } from '@/types';
import { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { RouterTypes } from 'umi';
import { Settings as SettingModelState } from '../../config/config';
import { GlobalModelState } from './global';
import { MenuModelState } from './menu';
import { UserModelState } from './user';

export { GlobalModelState, MenuModelState, SettingModelState, UserModelState };

export interface MenuDataItem {
  authority?: string[] | string;
  children?: MenuDataItem[];
  hideChildrenInMenu?: boolean;
  hideInMenu?: boolean;
  icon?: string;
  locale?: string;
  name?: string;
  path: string;
  [key: string]: any;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ConnectState) => T) => T },
) => void;

/**
 * @type P: Type of payload
 * @type C: Type of callback
 */
export type Dispatch = <P = any, C = (payload: P) => void>(action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}) => any;

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
    login?: boolean;
  };
}

export interface ConnectState {
  global: GlobalModelState;
  loading: Loading;
  menu: MenuModelState;
  setting: SettingModelState;
  user: UserModelState;
}

/**
 * @type T: Params matched in dynamic routing
 */
export interface ConnectProps<T extends { [key: string]: any } = {}>
  extends Partial<RouterTypes<Route>> {
  dispatch?: Dispatch;
}

export default ConnectState;
