import { IConfig } from 'umi-types';
import { common } from './config';

// 生产环境
export default {
  ...common,
  define: {
    IS_PROD: true,
    IS_DEV: false,
    API_BASE: 'http://localhost:3008',
  },
} as IConfig;
