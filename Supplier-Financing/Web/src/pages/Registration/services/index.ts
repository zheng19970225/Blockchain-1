import { APIResponse } from '@/types';
import { CurrentUser } from '@/models/user';
import request from '@/utils/request';

/**
 * 账户注册请求响应
 */
export interface ResponseRegistration extends APIResponse {
  data: CurrentUser;
}

/**
 * 发起账户注册请求。
 * @param data 账户注册相关信息
 */
export function doRegisterBank(data: any) {
  return request<ResponseRegistration>('/user/register/bank', { method: 'POST', data });
}

/**
 * 发起账户注册请求。
 * @param data 账户注册相关信息
 */
export function doRegisterCompany(data: any) {
  return request<ResponseRegistration>('/user/register/company', { method: 'POST', data });
}
