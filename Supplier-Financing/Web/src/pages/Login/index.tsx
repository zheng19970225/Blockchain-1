import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps, UserModelState } from '@/models/connect';
import { formItemLayout, tailFormItemLayout } from '@/utils/form';
import { Button, Card, Form, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import React from 'react';
import { formatMessage } from 'umi-plugin-locale';
import { LoginLoginActionType } from '@/models/login';

interface LoginPageProps extends ConnectProps, FormComponentProps {
  user: UserModelState;
  loading: boolean;
}

@connect(({ user, loading }: ConnectState) => ({
  user,
  loading: loading.effects['login/login'],
}))
@Form.create<LoginPageProps>()
class LoginPage extends React.Component<LoginPageProps> {
  onLoginButtonPress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const data = { uscc: values['uscc'] as string, password: values['password'] as string };
      this.props.dispatch!({ type: 'login/login', payload: data } as LoginLoginActionType);
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      user,
    } = this.props;
    return (
      <GridContent>
        <Card bordered={false}>
          <Form {...formItemLayout} onSubmit={this.onLoginButtonPress}>
            <Form.Item label={formatMessage({ id: 'account.uscc' })}>
              {getFieldDecorator('uscc', {
                rules: [{ required: true, message: formatMessage({ id: 'login.uscc.error' }) }],
              })(<Input placeholder={formatMessage({ id: 'login.uscc.placeholder' })} />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'account.password' })}>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: formatMessage({ id: 'login.password.error' }) }],
              })(
                <Input
                  placeholder={formatMessage({ id: 'login.password.placeholder' })}
                  type="password"
                />,
              )}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: 'login.button' })}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </GridContent>
    );
  }
}

export default LoginPage;
