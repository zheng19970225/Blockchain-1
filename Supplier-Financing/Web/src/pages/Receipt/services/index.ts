import request from '@/utils/request';
import { APIResponse } from '@/types';

/**
 * 获取账户凭据总金额信息响应
 */
export interface ResponseGetTotalReceipts extends APIResponse {
  data: { in_receipts: string; out_receipts: string };
}

/**
 * 获取账户凭据总金额信息。
 */
export function doGetTotalReceipts() {
  return request<ResponseGetTotalReceipts>('/receipt');
}
