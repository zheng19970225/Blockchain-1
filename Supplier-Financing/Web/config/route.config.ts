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
      {
        authority: ['guest'],
        path: '/login',
        hideInMenu: true,
        routes: [
          { authority: ['guest'], path: '/login', component: './Login', name: 'login' },
          {
            authority: ['guest'],
            path: '/login/callback',
            component: './Login/callback',
            name: 'login',
          },
        ],
      },
      { path: '/', redirect: '/welcome' },
      {
        hideInMenu: true,
        path: '/welcome',
        name: 'welcome',
        icon: 'smile',
        component: './Welcome',
      },
      {
        authority: ['guest', 'user'],
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        hideInMenu: true,
        routes: [
          {
            authority: ['guest', 'user'],
            path: '/exception/403',
            name: 'forbidden',
            component: './Exception/403',
          },
          {
            authority: ['guest', 'user'],
            path: '/exception/404',
            name: 'not-found',
            component: './Exception/404',
          },
        ],
      },
    ],
  },
];
