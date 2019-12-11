import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps, UserModelState } from '@/models/connect';
import { LoginCallbackActionType } from '@/models/login';
import { CurrentUser } from '@/models/user';
import { connect } from 'dva';
import React from 'react';

interface LoginCallbackPageProps extends ConnectProps {
  user: UserModelState;
  loading: boolean;
}

class LoginCallbackPage extends React.Component<LoginCallbackPageProps> {
  constructor(props: LoginCallbackPageProps) {
    super(props);
  }

  componentDidMount() {
    if (this.user && !!this.user.uid) {
      this.props.dispatch!({
        type: 'login/callback',
        payload: this.user,
      } as LoginCallbackActionType);
      return;
    }
  }

  get user() {
    const { location } = this.props;
    if (!location) return null;
    const { query } = location as any;
    if (!query) return null;
    const { user }: { user: string } = query;
    let tmp: CurrentUser;
    try {
      tmp = JSON.parse(user);
    } catch (err) {
      return null;
    }
    return tmp;
  }

  render() {
    return (
      <GridContent>
        <>
          {!this.user ? <div>请先关注“早知招聘服务号”公众号，后再登录。</div> : <div>登录成功</div>}
        </>
      </GridContent>
    );
  }
}

export default connect(({ user, loading }: ConnectState) => ({
  user,
  loading: loading.effects['login/login'],
}))(LoginCallbackPage);
