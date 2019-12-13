import { Drawer } from 'antd';
import React from 'react';
import SiderMenu, { SiderMenuProps } from './SiderMenu';
import { getFlatMenuKeys } from './SiderMenuUtils';

class SiderMenuWrapper extends React.PureComponent<SiderMenuProps> {
  static defaultProps: Partial<SiderMenuProps> = {
    onCollapse: () => void 0,
  };

  onClose = (e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => {
    const { onCollapse } = this.props;
    onCollapse!(true);
  };

  render() {
    const { isMobile, menuData, collapsed } = this.props;
    const flatMenuKeys = getFlatMenuKeys(menuData);
    return isMobile ? (
      <Drawer
        visible={!collapsed}
        placement="left"
        onClose={this.onClose}
        style={{
          padding: 0,
          height: '100vh',
        }}
      >
        <SiderMenu
          {...this.props}
          flatMenuKeys={flatMenuKeys}
          collapsed={isMobile ? false : collapsed}
        />
      </Drawer>
    ) : (
      <SiderMenu {...this.props} flatMenuKeys={flatMenuKeys} />
    );
  }
}

export default SiderMenuWrapper;
