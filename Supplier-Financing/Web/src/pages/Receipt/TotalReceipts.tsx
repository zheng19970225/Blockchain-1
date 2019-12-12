import React, { useState, useEffect } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { formatCurrency } from '@/utils/utils';
import request from '@/utils/request';
import ChartCard from '@/components/ChartCard';
import { doGetTotalReceipts } from './services';
import { AppCode, formatAppCode } from '@/utils/enum';
import { message } from 'antd';

export function TotalReceipts() {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState({ inReceipts: '0', outReceipts: '0' });

  useEffect(() => {
    doGetTotalReceipts().then(res => {
      if (res.code !== AppCode.SUCCESS) {
        // tslint:no-console
        console.error(res.msg, res.data);
        message.error(formatAppCode(res.sub));
        return;
      }
      setReceipts({ inReceipts: res.data.in_receipts, outReceipts: res.data.out_receipts });
      setLoading(false);
    });
  });

  return (
    <>
      <ChartCard
        loading={loading}
        title={formatMessage({ id: 'account.inReceipts' })}
        total={formatCurrency(parseFloat(receipts.inReceipts))}
      />
      <ChartCard
        loading={loading}
        style={{ marginTop: 24 }}
        title={formatMessage({ id: 'account.outReceipts' })}
        total={formatCurrency(parseFloat(receipts.outReceipts))}
      />
    </>
  );
}
