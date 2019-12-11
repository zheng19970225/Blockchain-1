import ChartCard from '@/components/ChartCard';
import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { CurrentUser, UserFetchTopUpMinAmountAction, UserTopUpAction } from '@/models/user';
import { formatCurrency, useHTTPS } from '@/utils/utils';
import { Button, Card, Form, Icon, Input, Modal, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import QRCode from 'qrcode.react';
import React from 'react';
import style from './index.less';

function Balance(props: { avatar: string; balance: number }) {
  return (
    <ChartCard
      title="您的余额"
      avatar={<img alt="balance" style={{ width: 56, height: 56 }} src={useHTTPS(props.avatar)} />}
      action={
        <Tooltip title="账户中剩余的金额">
          <Icon type="info-circle-o" />
        </Tooltip>
      }
      total={formatCurrency(props.balance / 100)}
    />
  );
}

interface AccountTopUpProps extends ConnectProps, FormComponentProps {
  currentUser: CurrentUser;
  loading: boolean;
  codeUrl: string;
  showModal: boolean;
  topup_min_amount: number;
}

@connect(({ user, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
  codeUrl: user.codeUrl,
  showModal: user.showModal,
  topup_min_amount: user.topup_min_amount,
}))
@Form.create<AccountTopUpProps>({ name: 'account.topup' })
class AccountTopUp extends React.PureComponent<AccountTopUpProps> {
  componentDidMount() {
    // 获取远程金额配置
    this.props.dispatch!({ type: 'user/fetchTopUpMinAmount' } as UserFetchTopUpMinAmountAction);
  }

  handleSubmit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      this.props.dispatch!({
        type: 'user/topup',
        payload: {
          amount: Number(values.topup_money).valueOf() * 100,
        },
      } as UserTopUpAction);
    });
  };

  // 用于 antd.form 的金额检验函数
  validateTopupMoney = (rule: any, value: any, callback: Function) => {
    const { topup_min_amount } = this.props;
    setTimeout(() => {
      if (value === '' || value === undefined) {
        callback([new Error('请输入充值金额')]);
        return;
      }
      let money = parseFloat(value);
      if (isNaN(money) || money < topup_min_amount / 100) {
        callback([new Error(`充值金额应不少于 ${topup_min_amount / 100} 元`)]);
        return;
      }
      // 取消充值金额的上限限制
      // if (money > 10000) {
      //   callback([new Error('充值金额应在 0 至 10000 元')]);
      //   return;
      // }
      callback();
    });
  };

  onModalButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.props.dispatch!({
      type: 'user/savePayModal',
      payload: {
        showModal: false,
      },
    });
  };

  onRefreshButtonPress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.props.dispatch!({ type: 'user/refreshCurrentUser' });
  };

  render() {
    const { form, currentUser, codeUrl, showModal, loading, topup_min_amount } = this.props;
    const { getFieldDecorator } = form;
    return (
      <GridContent>
        <div className={style.button_contain}>
          <Button
            type="primary"
            disabled={loading}
            onClick={this.onRefreshButtonPress}
            style={{ marginRight: 20, marginBottom: 20 }}
          >
            <Icon type="reload" />
            刷新
          </Button>
        </div>
        <Balance balance={currentUser.balance!} avatar={currentUser.avatar!} />
        <Card bordered={false} style={{ marginTop: 24 }}>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <Form.Item label="充值金额（元）">
              {getFieldDecorator('topup_money', {
                rules: [{ validator: this.validateTopupMoney }],
              })(<Input type="number" placeholder={`最低金额为 ${topup_min_amount / 100} 元`} />)}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                充值
              </Button>
            </Form.Item>
          </Form>
          <Modal
            visible={showModal}
            centered={true}
            cancelButtonDisabled={true}
            closable={false}
            onOk={this.onModalButtonPress}
            width={350}
            title={'请使用微信扫码支付'}
            footer={
              <Button type="primary" onClick={this.onModalButtonPress}>
                我已支付
              </Button>
            }
          >
            <div style={{ width: '100%' }}>
              <QRCode style={{ margin: 'auto' }} value={codeUrl} />
            </div>
          </Modal>
        </Card>
      </GridContent>
    );
  }
}

export default AccountTopUp;
