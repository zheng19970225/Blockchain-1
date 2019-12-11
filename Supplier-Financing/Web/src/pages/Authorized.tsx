import { ConnectProps, ConnectState, UserModelState } from '@/models/connect';
import { Route } from '@/types';
import { getAuthority } from '@/utils/authority';
import Authorized from '@/utils/Authorized';
import { connect } from 'dva';
import pathToRegexp from 'path-to-regexp';
import React from 'react';
import Redirect from 'umi/redirect';

interface AuthComponentProps extends ConnectProps {
  routerData: Route[];
  user: UserModelState;
}

const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined = getAuthority();
  routeData.forEach(route => {
    if (pathToRegexp(`${route.path}(.*)`).test(path)) {
      authorities = route.authority || authorities;
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

const AuthComponent: React.FC<AuthComponentProps> = ({ children, location, routerData, user }) => {
  const { currentUser } = user;
  return (
    <>
      <Authorized
        authority={getRouteAuthority(location!.pathname, routerData)!}
        noMatch={
          currentUser.uid !== 0 ? (
            <Redirect to="/account/center" />
          ) : location!.pathname === '/exception/404' ? null : (
            <Redirect to="/exception/404" />
          )
        }
      >
        {children}
      </Authorized>
    </>
  );
};

export default connect(({ menu, user }: ConnectState) => ({
  routerData: menu.routerData,
  user,
}))(AuthComponent);
