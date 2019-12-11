import { MenuTheme } from 'antd/es/menu';
import { IConfig } from 'umi-types';
import { plugins } from './plugin.config';
import { routes } from './route.config';

type ContentWidth = 'Fluid' | 'Fixed';

export interface Settings {
  navTheme: MenuTheme;
  primaryColor: string;
  layout: 'sidemenu' | 'topmenu';
  contentWidth: ContentWidth;
  fixedHeader: boolean;
  autoHideHeader: boolean;
  fixSiderBar: boolean;
  title: string;
  pwa: boolean;
  iconfontUrl: string;
  colorWeak: boolean;
}

// 页面设置
export const settings: Settings = {
  navTheme: 'light',
  primaryColor: '#1890FF',
  layout: 'sidemenu',
  contentWidth: 'Fixed',
  fixedHeader: true,
  autoHideHeader: false,
  fixSiderBar: true,
  title: '供应链金融平台',
  pwa: false,
  iconfontUrl: '',
  colorWeak: false,
};

// 多环境的公共配置
export const common = {
  plugins,
  routes,
  treeShaking: true,
  targets: {
    ie: 11,
  },
  theme: {
    'primary-color': settings.primaryColor,
  },
  history: 'hash',
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
};

// 本地开发
export default {
  ...common,
  define: {
    IS_PROD: false,
    IS_DEV: true,
    API_BASE: 'http://localhost:3008',
  },
} as IConfig;

// 本地开发所使用的用户UID
export const DEVELOPMENT_UID = 1;
