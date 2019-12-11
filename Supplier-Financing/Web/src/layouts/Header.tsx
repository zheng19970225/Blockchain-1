import React, { PureComponent } from 'react';
import { Layout } from 'antd';
import Animate from 'rc-animate';
import { connect } from 'dva';
import router from 'umi/router';
import GlobalHeader from '@/components/GlobalHeader';
import TopNavHeader from '@/components/TopNavHeader';
import styles from './Header.less';
import { Settings } from 'config/config';
import ConnectState, { ConnectProps } from '@/models/connect';
import { RouterTypes } from 'umi';
import { Route } from '@/types';
import { LoginLogoutActionType } from '@/models/login';

const { Header } = Layout;

export interface HeaderViewProps extends ConnectProps, Partial<RouterTypes<Route>> {
  isMobile?: boolean;
  collapsed?: boolean;
  settings: Settings;
  handleMenuCollapse?: (collapse: boolean) => void;
  loginLoading: boolean;
}

interface HeaderViewState {
  visible: boolean;
}

class HeaderView extends PureComponent<HeaderViewProps, HeaderViewState> {
  ticking: boolean = false;
  oldScrollTop: number = 0;
  state = {
    visible: true,
  };

  static getDerivedStateFromProps(props: HeaderViewProps, state: HeaderViewState) {
    if (!props.settings.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll);
  }

  getHeadWidth: () => string = () => {
    const { isMobile, collapsed, settings } = this.props;
    const { fixedHeader, layout } = settings;
    if (isMobile || !fixedHeader || layout === 'topmenu') {
      return '100%';
    }
    return collapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)';
  };

  handleMenuClick = ({ key }: { key: string }) => {
    const { dispatch, location } = this.props;
    if (key === 'userCenter' && location!.pathname !== '/account/center') {
      router.push('/account/center');
      return;
    }
    if (key === 'topup' && location!.pathname !== '/account/topup') {
      router.push('/account/topup');
      return;
    }
    if (key === 'transaction' && location!.pathname !== '/account/transaction') {
      router.push('/account/transaction');
      return;
    }
    if (key === 'logout') {
      dispatch!({ type: 'login/logout' } as LoginLogoutActionType);
    }
  };

  handleScroll: () => void = () => {
    const { autoHideHeader } = this.props.settings;
    const { visible } = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
        } else if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        } else if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
  };

  render() {
    const { isMobile, handleMenuCollapse, settings } = this.props;
    const { layout, fixedHeader } = settings;
    const { visible } = this.state;
    const isTop = layout === 'topmenu';
    const width = this.getHeadWidth();
    const HeaderDom = visible ? (
      <Header style={{ padding: 0, width }} className={fixedHeader ? styles.fixedHeader : ''}>
        {isTop && !isMobile ? (
          <TopNavHeader
            mode="horizontal"
            onCollapse={handleMenuCollapse!}
            onMenuClick={this.handleMenuClick}
            {...this.props}
          />
        ) : (
          <GlobalHeader
            onCollapse={handleMenuCollapse!}
            onMenuClick={this.handleMenuClick}
            {...this.props}
          />
        )}
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  }
}

export default connect(({ user, global, setting, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  setting,
  loginLoading: loading.effects['login/login'] || loading.effects['login/logout'],
}))(HeaderView);
