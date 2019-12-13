import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import {
  CurrentUser,
  formatUserTypeMessage,
  UserType,
  UserRegisterCompanyActionType,
} from '@/models/user';
import { disabledStyle, formItemLayout, tailFormItemLayout } from '@/utils/form';
import { Button, Card, Form, Input } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { connect } from 'dva';
import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';

interface CompanyRegistrationProps extends ConnectProps, FormComponentProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface CompanyRegistrationState {}

@connect(({ user, loading }: ConnectState) => ({
  loading: loading.models.user!,
  currentUser: user.currentUser,
}))
@Form.create<CompanyRegistrationProps>()
class CompanyRegistration extends React.Component<
  CompanyRegistrationProps,
  CompanyRegistrationState
> {
  state: CompanyRegistrationState = {};

  onRegisterButtonPress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { setFields } = this.props.form;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { uscc, address, password, publicKey, privateKey }: { [key: string]: string } = values;
      if (uscc.length !== 18) {
        setFields({
          uscc: { errors: [new Error(formatMessage({ id: 'registration.uscc.error' }))] },
        });
        return;
      }
      if (address.length !== 42) {
        setFields({
          address: { errors: [new Error(formatMessage({ id: 'registration.address.error' }))] },
        });
        return;
      }
      this.props.dispatch!({
        type: 'user/registerCompany',
        payload: { uscc, address, password, publicKey, privateKey },
      } as UserRegisterCompanyActionType);
    });
  };

  render() {
    const {
      loading,
      currentUser,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <GridContent>
        <Card bordered={false} style={{ marginTop: 24 }} loading={loading}>
          <Form {...formItemLayout} onSubmit={this.onRegisterButtonPress}>
            <Form.Item label={formatMessage({ id: 'registration.uscc' })}>
              {getFieldDecorator('uscc', {
                rules: [
                  { required: true, message: formatMessage({ id: 'registration.uscc.error' }) },
                ],
              })(<Input placeholder={formatMessage({ id: 'registration.uscc.placeholder' })} />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'registration.address' })}>
              {getFieldDecorator('address', {
                rules: [
                  { required: true, message: formatMessage({ id: 'registration.address.error' }) },
                ],
              })(
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 2 }}
                  placeholder={formatMessage({ id: 'registration.address.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'registration.type' })}>
              {getFieldDecorator('type', {
                initialValue: formatUserTypeMessage(
                  currentUser.type === UserType.ADMIN_BANK ? UserType.BANK : UserType.COMPANY,
                ),
              })(<Input disabled={true} style={disabledStyle} />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'registration.password' })}>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: formatMessage({ id: 'registration.password.error' }) },
                ],
              })(
                <Input placeholder={formatMessage({ id: 'registration.password.placeholder' })} />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'registration.publicKey' })}>
              {getFieldDecorator('publicKey', {
                initialValue: currentUser.address,
              })(
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 2 }}
                  disabled={true}
                  style={disabledStyle}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'registration.privateKey' })}>
              {getFieldDecorator('privateKey', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'registration.privateKey.error' }),
                  },
                ],
              })(
                <Input.TextArea
                  autoSize={{ minRows: 8, maxRows: 10 }}
                  placeholder={formatMessage({ id: 'registration.privateKey.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: 'registration.submit' })}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </GridContent>
    );
  }
}

export default CompanyRegistration;
