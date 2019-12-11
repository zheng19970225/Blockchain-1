import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { HISTORY_TYPE, TransactionType, UserFetchTransactionHistoryAction } from '@/models/user';
import { Button, Card, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva';
import React from 'react';
import { router } from 'umi';

// Table 列属性
const columns: ColumnProps<TransactionType>[] = [
  {
    title: '类型',
    dataIndex: 'type',
    render: (type: HISTORY_TYPE) => (type === HISTORY_TYPE.PUBLISH ? '发布职位' : '账户充值'),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    render: (amount: number, item: TransactionType) =>
      item.type === HISTORY_TYPE.PUBLISH ? -amount / 100 : `+${amount / 100}`,
  },
  {
    title: '职位',
    dataIndex: 'job_id',
    render: (job_id?: number) => (job_id === undefined ? 'NULL' : job_id),
  },
  {
    title: '交易时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
  },
];

interface AccountTransactionProps extends ConnectProps {
  loading: boolean;
  transactions: TransactionType[];
}

@connect(({ user, loading }: ConnectState) => ({
  loading: loading.models.user,
  transactions: user.transactions,
}))
class AccountTransaction extends React.Component<AccountTransactionProps> {
  componentDidMount() {
    this.props.dispatch!({
      type: 'user/fetchTransactionHistory',
    } as UserFetchTransactionHistoryAction);
  }

  // 对每条记录绑定点击事件
  onRow = (record: TransactionType, index: number) => {
    return {
      onClick: () => {
        // 判断记录类型，若为发布职位，则跳转页面，否则不跳转
        if (!record.job_id) return;
        router.push({
          pathname: `/job/${record.job_id}`,
          state: {
            fromTransaction: true,
          },
        });
      },
    };
  };

  render() {
    const { loading, transactions } = this.props;
    // const data: TransactionType[] = [
    //   {
    //     id: 11,
    //     amount: 100,
    //     type: HISTORY_TYPE.PUBLISH,
    //     job_id: 1,
    //     timestamp: '2019-05-06 23:17:03',
    //   },
    //   { id: 10, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 23:16:03' },
    //   { id: 9, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 22:16:03' },
    //   { id: 8, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 21:16:03' },
    //   { id: 7, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 20:16:03' },
    //   { id: 6, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 19:16:03' },
    //   { id: 5, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 18:16:03' },
    //   { id: 4, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 17:16:03' },
    //   { id: 3, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 16:16:03' },
    //   { id: 2, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 15:16:03' },
    //   { id: 1, amount: 200, type: HISTORY_TYPE.TOPUP, timestamp: '2019-05-06 14:16:03' },
    //   {
    //     id: 0,
    //     amount: 200,
    //     type: HISTORY_TYPE.PUBLISH,
    //     job_id: 14,
    //     timestamp: '2019-05-06 12:16:03',
    //   },
    // ];
    return (
      <GridContent>
        <div>
          <Button style={{ marginRight: 20 }}>共有 {transactions.length} 条交易记录</Button>
        </div>
        <Card
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
          bordered={false}
        >
          <Table
            pagination={{
              total: transactions.length,
              position: 'both',
              pageSize: 10,
            }}
            onRow={this.onRow}
            rowKey="id"
            loading={loading}
            dataSource={transactions}
            columns={columns}
          />
        </Card>
      </GridContent>
    );
  }
}

export default AccountTransaction;
