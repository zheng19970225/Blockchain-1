import React, { createElement } from 'react';
import * as H from 'history';
import classNames from 'classnames';
import { Button } from 'antd';
import config from './config';
import styles from './index.less';

export interface ExceptionProps<
  L = {
    to: H.LocationDescriptor;
    href?: string;
    replace?: boolean;
    innerRef?: React.Ref<HTMLAnchorElement>;
  }
> {
  type: 403 | 404 | 500;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  img?: string;
  actions?: React.ReactNode;
  linkElement?: string | React.ComponentType<L>;
  style?: React.CSSProperties;
  className?: string;
  backText?: React.ReactNode;
  redirect?: string;
}

class Exception extends React.PureComponent<ExceptionProps> {
  static defaultProps = {
    backText: '返回主页',
    redirect: '/',
  };

  constructor(props: ExceptionProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      className,
      backText,
      linkElement = 'a',
      type,
      title,
      desc,
      img,
      actions,
      redirect,
      ...rest
    } = this.props;
    const clsString = classNames(styles.exception, className);
    return (
      <div className={clsString} {...rest}>
        <div className={styles.imgBlock}>
          <div
            className={styles.imgEle}
            style={{ backgroundImage: `url(${img || config[type].img})` }}
          />
        </div>
        <div className={styles.content}>
          <h1>{title || config[type].title}</h1>
          <div className={styles.desc}>{desc || config[type].desc}</div>
          <div className={styles.actions}>
            {actions ||
              createElement(
                linkElement,
                {
                  to: redirect!,
                  href: redirect!,
                },
                <Button type="primary">{backText}</Button>,
              )}
          </div>
        </div>
      </div>
    );
  }
}

export default Exception;
