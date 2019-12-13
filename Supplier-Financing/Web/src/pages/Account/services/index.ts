import { APIResponse } from '@/types';
import { CurrentUser } from '@/models/user';
import request from '@/utils/request';

/**
 * 获取所有账户信息响应
 */
export interface ResponseGetAllUsers extends APIResponse {
  data: {
    list: CurrentUser[];
    total: number;
    next: number;
  };
}

/**
 * 获取所有账户信息。
 */
export function doGetAllUsers(pageSize: number, offset: number) {
  return request<ResponseGetAllUsers>(`/user/all?pageSize=${pageSize}&offset=${offset}`);
}
