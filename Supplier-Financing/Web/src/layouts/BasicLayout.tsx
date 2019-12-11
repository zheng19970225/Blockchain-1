import SiderMenu from '@/components/SiderMenu';
import { SiderMenuProps } from '@/components/SiderMenu/SiderMenu';
import ConnectState, { ConnectProps } from '@/models/connect';
import { MenuDataItem, Route } from '@/types';
import { Layout } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import pathToRegexp from 'path-to-regexp';
import React from 'react';
import { ContainerQuery } from 'react-container-query';
import DocumentTitle from 'react-document-title';
import Media from 'react-media';
import { RouterTypes, withRouter } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';
import { settings, Settings } from '../../config/config';
import logo from '../assets/logo.svg';
import styles from './BasicLayout.less';
import Footer from './Footer';
import Header, { HeaderViewProps } from './Header';
import Context from './MenuContext';

const { Content } = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

interface BasicLayoutProps
  extends ConnectProps,
    Partial<RouterTypes<Route>>,
    SiderMenuProps,
    HeaderViewProps {
  logo: string;
  collapsed: boolean;
  isMobile: boolean;
  breadcrumbNameMap?: { [path: string]: MenuDataItem };
  settings: Settings;
  authority: string | string[];
}

class BasicLayout extends React.PureComponent<BasicLayoutProps> {
  constructor(props: BasicLayoutProps) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
  }

  componentDidMount() {
    const { dispatch, route } = this.props;
    const { routes, authority } = route!;
    dispatch!({ type: 'user/fetchCurrentUser' });
    dispatch!({ type: 'menu/getMenuData', payload: { routes, authority } });
  }

  componentDidUpdate(prevProps: BasicLayoutProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
    const { collapsed, isMobile } = this.props;
    if (isMobile && !prevProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
  }

  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  matchParamsPath = (pathname: string, breadcrumbNameMap: { [path: string]: MenuDataItem }) => {
    const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname));
    return breadcrumbNameMap[pathKey!];
  };

  getPageTitle = (pathname: string, breadcrumbNameMap: { [path: string]: MenuDataItem }) => {
    const currRouterData = this.matchParamsPath(pathname, breadcrumbNameMap);
    if (!currRouterData) {
      return settings.title;
    }
    const pageName = formatMessage({
      id: currRouterData.locale! || currRouterData.name!,
      defaultMessage: currRouterData.name,
    });
    return `${pageName} - ${settings.title}`;
  };

  getLayoutStyle = () => {
    const { isMobile, collapsed, settings } = this.props;
    if (settings.fixSiderBar && settings.layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  handleMenuCollapse = (collapsed: boolean) => {
    const { dispatch } = this.props;
    dispatch!({ type: 'global/changeLayoutCollapsed', payload: collapsed });
  };

  render() {
    const { settings, children, location, isMobile, menuData, breadcrumbNameMap } = this.props;
    const isTop = settings.layout === 'topmenu';
    const contentStyle = !settings.fixedHeader ? { paddingTop: 0 } : {};
    const layout = (
      <Layout>
        {isTop && !isMobile ? null : (
          <SiderMenu
            logo={logo}
            theme={settings.navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
            {...this.props}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh',
          }}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />
          <Content className={styles.content} style={contentStyle}>
            {children}
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(location!.pathname, breadcrumbNameMap!)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

export default withRouter(
  connect(({ global, setting, menu }: ConnectState) => ({
    collapsed: global.collapsed,
    menuData: menu.menuData,
    breadcrumbNameMap: menu.breadcrumbNameMap,
    settings: setting,
  }))((props: BasicLayoutProps) => (
    <Media query="(max-width: 599px)">
      {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
    </Media>
  )),
);
