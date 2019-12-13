import { IPlugin } from 'umi-types';

export const plugins: IPlugin[] = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      locale: {
        enable: true,
        default: 'zh-CN',
        baseNavigator: false,
      },
      targets: {
        ie: 11,
      },
    },
  ],
];
