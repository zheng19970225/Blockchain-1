interface Route {
  path?: string;
  component?: string;
  routes?: Route[];
  Routes?: string[];
  redirect?: string;
  [key: string]: any;
  authority?: string | string[];
  hideInMenu?: boolean;
}

export const routes: Route[] = [
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // 登录页面
      {
        authority: ['guest'],
        path: '/login',
        hideInMenu: true,
        routes: [{ authority: ['guest'], path: '/login', component: './Login', name: 'login' }],
      },
      // 欢迎页面
      { path: '/', redirect: '/welcome' },
      {
        hideInMenu: true,
        path: '/welcome',
        name: 'welcome',
        icon: 'smile',
        component: './Welcome',
      },
      // 账户页面路由
      {
        path: '/account',
        name: 'account',
        icon: 'user',
        authority: ['admin_bank', 'bank', 'company'],
        routes: [
          {
            path: '/account/center',
            name: 'center',
            icon: 'user',
            authority: ['admin_bank', 'bank', 'company'],
            component: './Account/Center',
          },
        ],
      },
      // 异常页面路由
      {
        authority: ['guest', 'admin_bank', 'bank', 'company'],
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        hideInMenu: true,
        routes: [
          {
            authority: ['guest', 'admin_bank', 'bank', 'company'],
            path: '/exception/403',
            name: 'forbidden',
            component: './Exception/403',
          },
          {
            authority: ['guest', 'admin_bank', 'bank', 'company'],
            path: '/exception/404',
            name: 'not-found',
            component: './Exception/404',
          },
        ],
      },
    ],
  },
];
