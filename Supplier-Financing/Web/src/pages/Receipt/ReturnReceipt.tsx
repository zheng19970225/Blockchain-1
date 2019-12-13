import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import { AppCode, formatAppCode } from '@/utils/enum';
import { disabledStyle, formItemLayout, tailFormItemLayout } from '@/utils/form';
import { Button, Card, Form, Input, InputNumber, message } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { connect } from 'dva';
import React from 'react';
import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';
import { doReturnReceipt } from './services';

interface ReturnReceiptProps extends ConnectProps, FormComponentProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface ReturnReceiptState {}

@connect(({ user, loading }: ConnectState) => ({
  loading: loading.models.user!,
  currentUser: user.currentUser,
}))
@Form.create<ReturnReceiptProps>()
class ReturnReceipt extends React.Component<ReturnReceiptProps, ReturnReceiptState> {
  state: ReturnReceiptState = {};

  onSubmitButtonPress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { receiptId, amount, publicKey, privateKey } = values;
      doReturnReceipt(receiptId, amount, publicKey, privateKey).then(res => {
        if (!res || res.code !== AppCode.SUCCESS) {
          message.error(formatMessage({ id: 'receipt.return.failure' }));
          message.error(formatAppCode(res.sub));
          return;
        }
        message.success(formatMessage({ id: 'receipt.return.success' }));
        router.replace('/receipt/detail');
      });
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
          <Form {...formItemLayout} onSubmit={this.onSubmitButtonPress}>
            <Form.Item label={formatMessage({ id: 'receipt.return.receiptId' })}>
              {getFieldDecorator('receiptId', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.return.receiptId.error' }),
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'receipt.return.receiptId.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'receipt.return.amount' })}>
              {getFieldDecorator('amount', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.return.amount.error' }),
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'receipt.return.amount.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'receipt.return.publicKey' })}>
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
            <Form.Item label={formatMessage({ id: 'receipt.return.privateKey' })}>
              {getFieldDecorator('privateKey', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.return.privateKey.error' }),
                  },
                ],
              })(
                <Input.TextArea
                  autoSize={{ minRows: 8, maxRows: 10 }}
                  placeholder={formatMessage({ id: 'receipt.return.privateKey.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: 'receipt.return.submit' })}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </GridContent>
    );
  }
}

export default ReturnReceipt;
