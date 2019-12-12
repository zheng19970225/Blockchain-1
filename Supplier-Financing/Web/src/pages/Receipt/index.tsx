import React from 'react';
import { ConnectProps } from '@/models/connect';
import { FormComponentProps } from 'antd/lib/form';
import GridContent from '@/components/GridContent';
import { TotalReceipts } from './TotalReceipts';

interface ReceiptPageProps extends ConnectProps, FormComponentProps {}

class ReceiptPage extends React.Component<ReceiptPageProps> {
  render() {
    return (
      <GridContent>
        <TotalReceipts />
      </GridContent>
    );
  }
}

export default ReceiptPage;
