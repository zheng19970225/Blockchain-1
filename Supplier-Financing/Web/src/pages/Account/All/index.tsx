import GridContent from '@/components/GridContent';
import ConnectState, { ConnectProps } from '@/models/connect';
import { CurrentUser, formatUserTypeMessage } from '@/models/user';
import { TotalReceipts } from '@/pages/Receipt/TotalReceipts';
import { disabledStyle, formItemLayout } from '@/utils/form';
import { Card, Form, Input, List, Table } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { connect } from 'dva';
import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { ColumnProps } from 'antd/lib/table';
import { doGetAllUsers } from '../services';
import { message } from 'antd';
import { formatAppCode } from '@/utils/enum';

interface AccountAllProps {}

interface AccountAllState {
  loading: boolean;
  dataSource: {
    list: CurrentUser[];
    total: number;
    next: number;
  };
}

const PAGE_SIZE = 10;

const columns: ColumnProps<CurrentUser>[] = [
  {
    title: formatMessage({ id: 'account.uscc' }),
    dataIndex: 'uscc',
    render: (uscc: string) => uscc,
  },
  {
    title: formatMessage({ id: 'account.type' }),
    dataIndex: 'type',
    render: (type: string) => formatUserTypeMessage(parseInt(type)),
  },
  {
    title: formatMessage({ id: 'account.address' }),
    dataIndex: 'address',
    render: (address: string) => address,
  },
];

class AccountAll extends React.Component<AccountAllProps, AccountAllState> {
  state: AccountAllState = {
    loading: true,
    dataSource: { list: [], total: 0, next: 0 },
  };

  componentDidMount() {
    // 获取全部数据（不分页）。
    doGetAllUsers(PAGE_SIZE, -1)
      .then(res => {
        if (res.code !== 200) {
          message.error(formatAppCode(res.sub));
          return;
        }
        this.setState({
          loading: false,
          dataSource: res.data,
        });
      })
      .catch(err => {
        message.error(err);
        this.setState({
          loading: false,
        });
      });
  }

  rowKey = (record: CurrentUser, index: number) => {
    return record.uscc;
  };

  render() {
    const { loading, dataSource } = this.state;
    return (
      <GridContent>
        <Card
          bordered={false}
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
          loading={loading}
        >
          <Table
            pagination={{
              total: dataSource.total,
              position: 'both',
              pageSize: PAGE_SIZE,
            }}
            rowKey={this.rowKey}
            loading={loading}
            dataSource={dataSource.list}
            columns={columns}
          />
        </Card>
      </GridContent>
    );
  }
}

export default AccountAll;
