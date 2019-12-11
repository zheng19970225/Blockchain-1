import React from 'react';
import styles from './index.less';
import { connect } from 'dva';
import ConnectState from '@/models/connect';

interface GridContentProps {
  contentWidth: 'Fixed' | 'Fluid';
}

class GridContent extends React.PureComponent<GridContentProps> {
  render() {
    const { contentWidth, children } = this.props;
    let className = `${styles.main}`;
    if (contentWidth === 'Fixed') {
      className = `${styles.main} ${styles.wide}`;
    }
    return <div className={className}>{children}</div>;
  }
}

export default connect(({ setting }: ConnectState) => ({ contentWidth: setting.contentWidth }))(
  GridContent,
);
