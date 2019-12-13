import request from '@/utils/request';
import { APIResponse } from '@/types';
import { Receipt } from '..';

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

/**
 * 获取凭证详情信息响应
 */
export interface ResponseGetDetailReceipts extends APIResponse {
  data: {
    total: number;
    next: number;
    list: Receipt[];
  };
}

/**
 * 获取凭证详情。
 */
export function doGetDetailReceipts(type: 'in' | 'out', pageSize: number, offset: number) {
  return request<ResponseGetDetailReceipts>(
    `/receipt/${type}?pageSize=${pageSize}&offset=${offset}`,
  );
}
