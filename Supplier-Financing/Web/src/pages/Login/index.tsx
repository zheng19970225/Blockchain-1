import ConnectState, { ConnectProps, UserModelState } from '@/models/connect';
import { LoginLoginActionType } from '@/models/login';
import { Button } from 'antd';
import { connect } from 'dva';
import React from 'react';

interface LoginPageProps extends ConnectProps {
  user: UserModelState;
  loading: boolean;
}

class LoginPage extends React.Component<LoginPageProps> {
  onSubmitButtonPressed = () => {
    this.props.dispatch!({
      type: 'login/login',
    } as LoginLoginActionType);
  };

  render() {
    return (
      <>
        {this.props.user.currentUser.nickname ? (
          '已登录'
        ) : this.props.loading === true ? (
          'waiting'
        ) : (
          <Button onClick={this.onSubmitButtonPressed}>Login</Button>
        )}
      </>
    );
  }
}

export default connect(({ user, loading }: ConnectState) => ({
  user,
  loading: loading.effects['login/login'],
}))(LoginPage);
