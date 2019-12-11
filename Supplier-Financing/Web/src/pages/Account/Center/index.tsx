import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { CurrentUser, UserType, formatUserType, formatUserTypeMessage } from '@/models/user';
import { disabledStyle, formItemLayout } from '@/utils/form';
import { Card, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { connect } from 'dva';
import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';

interface AccountCenterProps extends ConnectProps, FormComponentProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface AccountCenterState {}

@connect(({ user, loading }: ConnectState) => ({
  loading: loading.models.user!,
  currentUser: user.currentUser,
}))
@Form.create<AccountCenterProps>()
class AccountCenter extends React.Component<AccountCenterProps, AccountCenterState> {
  state: AccountCenterState = {};

  componentDidMount() {}

  render() {
    const {
      loading,
      currentUser,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <GridContent>
        <Card bordered={false} style={{ marginTop: 24 }} loading={loading}>
          <Form {...formItemLayout}>
            <Form.Item label={formatMessage({ id: 'account.uscc' })}>
              {getFieldDecorator('uscc', {
                initialValue: currentUser.uscc,
              })(<Input disabled={true} style={disabledStyle} />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'account.type' })}>
              {getFieldDecorator('type', {
                initialValue: formatUserTypeMessage(currentUser.type),
              })(<Input disabled={true} style={disabledStyle} />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'account.address' })}>
              {getFieldDecorator('address', {
                initialValue: currentUser.address,
              })(<Input.TextArea disabled={true} style={disabledStyle} />)}
            </Form.Item>
          </Form>
        </Card>
      </GridContent>
    );
  }
}

export default AccountCenter;
