import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import { AppCode, formatAppCode } from '@/utils/enum';
import { disabledStyle, formItemLayout, tailFormItemLayout } from '@/utils/form';
import { Button, Card, DatePicker, Form, Input, InputNumber, message } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { connect } from 'dva';
import { Moment } from 'moment';
import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { doTransferReceipt } from './services';

interface TransferReceiptProps extends ConnectProps, FormComponentProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface TransferReceiptState {}

@connect(({ user, loading }: ConnectState) => ({
  loading: loading.models.user!,
  currentUser: user.currentUser,
}))
@Form.create<TransferReceiptProps>()
class TransferReceipt extends React.Component<TransferReceiptProps, TransferReceiptState> {
  state: TransferReceiptState = {};

  onSubmitButtonPress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { address: debtee, amount, deadline, publicKey, privateKey } = values;
      doTransferReceipt(debtee, amount, (deadline as Moment).unix(), publicKey, privateKey).then(
        res => {
          if (!res || res.code !== AppCode.SUCCESS) {
            message.error(formatMessage({ id: 'receipt.transfer.failure' }));
            message.error(formatAppCode(res.sub));
            return;
          }
          message.success(formatMessage({ id: 'receipt.transfer.success' }));
          router.replace('/receipt/detail');
        },
      );
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
            <Form.Item label={formatMessage({ id: 'receipt.transfer.address' })}>
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.transfer.address.error' }),
                  },
                ],
              })(
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 2 }}
                  placeholder={formatMessage({ id: 'receipt.transfer.address.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'receipt.transfer.deadline' })}>
              {getFieldDecorator('deadline', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.transfer.deadline.error' }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY/MM/DD"
                  placeholder={formatMessage({ id: 'receipt.transfer.deadline.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'receipt.transfer.amount' })}>
              {getFieldDecorator('amount', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.transfer.amount.error' }),
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'receipt.transfer.amount.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'receipt.transfer.publicKey' })}>
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
            <Form.Item label={formatMessage({ id: 'receipt.transfer.privateKey' })}>
              {getFieldDecorator('privateKey', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'receipt.transfer.privateKey.error' }),
                  },
                ],
              })(
                <Input.TextArea
                  autoSize={{ minRows: 8, maxRows: 10 }}
                  placeholder={formatMessage({ id: 'receipt.transfer.privateKey.placeholder' })}
                />,
              )}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: 'receipt.transfer.submit' })}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </GridContent>
    );
  }
}

export default TransferReceipt;
