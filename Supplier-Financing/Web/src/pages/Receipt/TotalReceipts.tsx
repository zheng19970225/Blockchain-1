import ChartCard from '@/components/ChartCard';
import { AppCode, formatAppCode } from '@/utils/enum';
import { formatCurrency } from '@/utils/utils';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { doGetTotalReceipts } from './services';

export function TotalReceipts() {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState({ inReceipts: '0', outReceipts: '0' });

  useEffect(() => {
    doGetTotalReceipts().then(res => {
      if (!res || res.code !== AppCode.SUCCESS) {
        message.error(formatAppCode(res.sub));
      }
      setReceipts({ inReceipts: res.data.in_receipts, outReceipts: res.data.out_receipts });
      setLoading(false);
    });
  }, []);

  return (
    <>
      <ChartCard
        loading={loading}
        title={formatMessage({ id: 'account.inReceipts' })}
        total={formatCurrency(parseInt(receipts.inReceipts) / 100)}
      />
      <ChartCard
        loading={loading}
        style={{ marginTop: 24 }}
        title={formatMessage({ id: 'account.outReceipts' })}
        total={formatCurrency(parseInt(receipts.outReceipts) / 100)}
      />
    </>
  );
}
