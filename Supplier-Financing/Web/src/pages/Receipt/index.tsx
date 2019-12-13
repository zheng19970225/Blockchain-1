import GridContent from '@/components/GridContent';
import { AppCode, formatAppCode } from '@/utils/enum';
import { formatCurrency } from '@/utils/utils';
import { Card, message, Table, Tabs } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { doGetDetailReceipts, ResponseGetDetailReceipts } from './services';
import { TotalReceipts } from './TotalReceipts';

const { TabPane } = Tabs;

interface ReceiptPageProps {}

export interface Receipt {
  debtor: string;
  debtee: string;
  receiptId: number;
  amount: string;
  deadline: string;
}

const columns: ColumnProps<Receipt>[] = [
  {
    title: formatMessage({ id: 'receipt.receiptId' }),
    dataIndex: 'receiptId',
  },
  {
    title: formatMessage({ id: 'receipt.debtor' }),
    dataIndex: 'debtor',
  },
  {
    title: formatMessage({ id: 'receipt.debtee' }),
    dataIndex: 'debtee',
  },
  {
    title: formatMessage({ id: 'receipt.amount' }),
    dataIndex: 'amount',
    render: (amount: string) => formatCurrency(parseInt(amount) / 100),
  },
  {
    title: formatMessage({ id: 'receipt.deadline' }),
    dataIndex: 'deadline',
    render: (deadline: string) => Moment(parseInt(deadline) * 1000).format('YYYY-MM-DD'),
  },
];

function DetailReceipt(props: { type: 'in' | 'out' }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({} as Pick<ResponseGetDetailReceipts, 'data'>['data']);

  const PAGE_SIZE = 5;

  useEffect(() => {
    // 获取全量数据（不分页）。
    doGetDetailReceipts(props.type, PAGE_SIZE, -1)
      .then(res => {
        if (!res || res.code !== AppCode.SUCCESS) {
          // tslint:no-console
          console.error(res.msg, res.data);
          message.error(formatAppCode(res.sub));
        }
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        message.error(err);
        setLoading(false);
      });
  }, []);

  // 隐藏列。
  // 借入凭证：显示凭证签发者。
  // 借出凭证：显示凭证接收者。
  const cols = [...columns];
  cols.splice(props.type === 'in' ? 2 : 1, 1);
  const rowKey = (record: Receipt, index: number) => {
    return record.receiptId + '';
  };

  return (
    <Table
      pagination={{
        total: data.total,
        position: 'bottom',
        pageSize: PAGE_SIZE,
      }}
      rowKey={rowKey}
      loading={loading}
      dataSource={data.list}
      columns={cols}
    />
  );
}

class ReceiptPage extends React.PureComponent<ReceiptPageProps> {
  render() {
    return (
      <GridContent>
        <TotalReceipts />
        <Card
          bordered={false}
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab={formatMessage({ id: 'receipt.in' })} key="1">
              <DetailReceipt type="in" />
            </TabPane>
            <TabPane tab={formatMessage({ id: 'receipt.out' })} key="2">
              <DetailReceipt type="out" />
            </TabPane>
          </Tabs>
        </Card>
      </GridContent>
    );
  }
}

export default ReceiptPage;
