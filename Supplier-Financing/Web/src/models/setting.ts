import { settings, Settings } from '../../config/config';

export interface SettingModelType {
  namespace: 'setting';
  state: Settings;
  effects: {};
  reducers: {};
}

const SettingModel: SettingModelType = {
  namespace: 'setting',
  state: settings,
  effects: {},
  reducers: {},
};

export default SettingModel;
