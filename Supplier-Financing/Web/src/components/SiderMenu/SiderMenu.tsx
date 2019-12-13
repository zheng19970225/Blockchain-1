import { Layout } from 'antd';
import classNames from 'classnames';
import { Settings } from 'config/config';
import React, { PureComponent, Suspense } from 'react';
import Link from 'umi/link';
import PageLoading from '../PageLoading';
import { BaseMenuProps } from './BaseMenu';
import styles from './index.less';
import { getDefaultCollapsedSubMenus } from './SiderMenuUtils';

const BaseMenu = React.lazy(() => import('./BaseMenu'));
const { Sider } = Layout;
let firstMount: boolean = true;

export const renderLogo: (logo: React.ReactNode) => React.ReactNode = logo => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  return logo;
};

export interface SiderMenuProps
  extends Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>> {
  logo?: React.ReactNode;
  settings: Settings;
}

interface SiderMenuState {
  pathname?: string;
  openKeys?: string[];
  flatMenuKeysLen?: number;
}

export default class SiderMenu extends PureComponent<SiderMenuProps, SiderMenuState> {
  constructor(props: SiderMenuProps) {
    super(props);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
    };
  }

  static defaultProps: Partial<SiderMenuProps> = {
    flatMenuKeys: [],
    onCollapse: () => void 0,
    isMobile: false,
    openKeys: [],
    collapsed: false,
    handleOpenChange: () => void 0,
    menuData: [],
  };

  static getDerivedStateFromProps(props: SiderMenuProps, state: SiderMenuState) {
    const { pathname } = state;
    if (props.location!.pathname !== pathname) {
      return {
        pathname: props.location!.pathname,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    return null;
  }

  componentDidMount() {
    firstMount = false;
  }

  isMainMenu: (key: string) => boolean = key => {
    const { menuData } = this.props;
    return menuData!.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange: (openKeys: string[]) => void = openKeys => {
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? ([openKeys.pop()!].filter(item => item) as string[]) : [...openKeys],
    });
  };

  onCollapse: (collapsed: boolean) => void = collapsed => {
    const { isMobile } = this.props;
    if (firstMount || !isMobile) this.props.onCollapse!(collapsed);
  };

  render() {
    const { collapsed, settings, theme, logo } = this.props;
    const { openKeys } = this.state;
    const props = collapsed ? {} : { openKeys };
    const siderClassName = classNames(styles.sider, {
      [styles.fixSiderBar]: settings.fixSiderBar,
      [styles.light]: theme === 'light',
    });
    return (
      <Sider
        trigger={null}
        collapsible={true}
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={this.onCollapse}
        width={256}
        theme={theme}
        className={siderClassName}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            {renderLogo(logo)}
            <h1>{settings.title}</h1>
          </Link>
        </div>
        <Suspense fallback={<PageLoading />}>
          <BaseMenu
            {...this.props}
            mode="inline"
            handleOpenChange={this.handleOpenChange}
            style={{ padding: '16px 0', width: '100%' }}
            {...props}
          />
        </Suspense>
      </Sider>
    );
  }
}
