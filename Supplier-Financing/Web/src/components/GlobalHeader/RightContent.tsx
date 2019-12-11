import { ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import { setAuthority } from '@/utils/authority';
import { useHTTPS } from '@/utils/utils';
import { Avatar, Icon, Menu, Spin } from 'antd';
import { Settings } from 'config/config';
import React, { PureComponent } from 'react';
import { router } from 'umi';
import { FormattedMessage } from 'umi-plugin-react/locale';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

interface ClickParam {
  key: string;
  keyPath: Array<string>;
  item: any;
  domEvent: any;
}

export interface GlobalHeaderRightProps extends ConnectProps {
  notices?: Array<{ datetime: string; id: string; key: string; extra: any; status: number }>;
  currentUser?: CurrentUser;
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onMenuClick?: (param: ClickParam) => void;
  onNoticeClear?: (tabName: string) => void;
  settings: Settings;
  loginLoading: boolean;
}

class GlobalHeaderRight extends PureComponent<GlobalHeaderRightProps> {
  onLoginButtonPressed = () => {
    setAuthority('guest');
    if (!IS_DEV) {
      this.props.dispatch!({ type: 'login/login' });
      return;
    } else {
      router.push('/login');
    }
  };

  render() {
    const { currentUser, onMenuClick, settings } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="userCenter">
          <Icon type="user" />
          <FormattedMessage id="menu.account.center" defaultMessage="个人中心" />
        </Menu.Item>
        <Menu.Item key="topup">
          <Icon type="dollar" />
          <FormattedMessage id="menu.account.topup" defaultMessage="账户充值" />
        </Menu.Item>
        <Menu.Item key="transaction">
          <Icon type="transaction" />
          <FormattedMessage id="menu.account.transaction" defaultMessage="交易记录" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          <FormattedMessage id="menu.account.logout" defaultMessage="注销" />
        </Menu.Item>
      </Menu>
    );
    let className = styles.right;
    if (settings!.navTheme === 'dark' && settings.layout === 'topmenu') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div className={className}>
        {this.props.loginLoading ? (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        ) : currentUser!.nickname ? (
          <HeaderDropdown overlay={menu} placement="topRight">
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                className={styles.avatar}
                src={useHTTPS(currentUser!.avatar!)}
                alt="avatar"
              />
              <span className={styles.name}>{currentUser!.nickname}</span>
            </span>
          </HeaderDropdown>
        ) : (
          <span
            className={`${styles.action} ${styles.account}`}
            onClick={this.onLoginButtonPressed}
          >
            <Avatar size="small" className={styles.avatar} src={currentUser!.avatar} alt="avatar" />
            <span className={styles.name}>请登录</span>
          </span>
        )}
      </div>
    );
  }
}

export default GlobalHeaderRight;
