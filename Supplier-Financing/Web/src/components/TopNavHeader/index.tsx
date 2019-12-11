import React, { PureComponent } from 'react';
import Link from 'umi/link';
import RightContent, { GlobalHeaderRightProps } from '../GlobalHeader/RightContent';
import BaseMenu from '../SiderMenu/BaseMenu';
import { getFlatMenuKeys } from '../SiderMenu/SiderMenuUtils';
import styles from './index.less';
import { Settings } from 'config/config';
import { SiderMenuProps, renderLogo } from '../SiderMenu/SiderMenu';

interface TopNavHeaderProps extends SiderMenuProps, GlobalHeaderRightProps {
  settings: Settings;
  onCollapse?: (collapse: boolean) => void;
}

interface TopNavHeaderState {
  maxWidth?: number;
}

export default class TopNavHeader extends PureComponent<TopNavHeaderProps, TopNavHeaderState> {
  state: TopNavHeaderState = {};

  static getDerivedStateFromProps(props: TopNavHeaderProps) {
    const { settings } = props;
    return {
      maxWidth:
        (settings.contentWidth === 'Fixed' && window.innerWidth > 1200 ? 1200 : window.innerWidth) -
        280 -
        120 -
        40,
    };
  }

  render() {
    const { settings, menuData, logo } = this.props;
    const { maxWidth } = this.state;
    const flatMenuKeys = getFlatMenuKeys(menuData);
    return (
      <div className={`${styles.head} ${settings.navTheme === 'light' ? styles.light : ''}`}>
        <div className={`${styles.main} ${settings.contentWidth === 'Fixed' ? styles.wide : ''}`}>
          <div className={styles.left}>
            <div className={styles.logo} key="logo" id="logo">
              <Link to="/">
                {renderLogo(logo)}
                <h1>{settings.title}</h1>
              </Link>
            </div>
            <div style={{ maxWidth }}>
              <BaseMenu {...this.props} flatMenuKeys={flatMenuKeys} className={styles.menu} />
            </div>
          </div>
          <RightContent {...this.props} />
        </div>
      </div>
    );
  }
}
