import React, { PureComponent, ReactNode } from 'react';
import { Icon } from 'antd';
import Link from 'umi/link';
import debounce from 'lodash/debounce';
import styles from './index.less';
import RightContent, { GlobalHeaderRightProps } from './RightContent';
import { HeaderViewProps } from '@/layouts/Header';

interface GlobalHeaderProps extends HeaderViewProps, GlobalHeaderRightProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
  logo?: string;
}

export default class GlobalHeader extends PureComponent<GlobalHeaderProps> {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  triggerResizeEvent = debounce(() => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  });

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    if (onCollapse) {
      onCollapse(!collapsed);
    }
    this.triggerResizeEvent();
  };

  renderLogo = (): ReactNode => {
    const { isMobile, logo } = this.props;
    if (isMobile) {
      return (
        <Link to="/" className={styles.logo} key="logo">
          <img src={logo} alt="logo" width="32" />
        </Link>
      );
    }
    return null;
  };

  render() {
    const { collapsed } = this.props;
    return (
      <div className={styles.header}>
        {this.renderLogo()}
        <span className={styles.trigger} onClick={this.toggle}>
          <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
        </span>
        <RightContent settings={this.props.settings} {...this.props} />
      </div>
    );
  }
}
