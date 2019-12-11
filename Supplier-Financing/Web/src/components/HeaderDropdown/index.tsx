import React, { PureComponent } from 'react';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

declare type OverlayFunc = () => React.ReactNode;

interface HeaderDropdownProps extends React.Props<any> {
  overlay: React.ReactNode | OverlayFunc;
  overlayClassName?: string;
  placement?: "bottomLeft" | "bottomRight" | "topLeft" | "topCenter" | "topRight" | "bottomCenter";
}

export default class HeaderDropdown extends PureComponent<HeaderDropdownProps> {
  render() {
    const { overlayClassName, ...props } = this.props;
    return (
      <Dropdown overlayClassName={classNames(styles.container, overlayClassName)} {...props} />
    );
  }
}
