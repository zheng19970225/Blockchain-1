import { APIResponse } from '@/types';
import request from '@/utils/request';
import { CurrentUser } from '@/models/user';

/**
 * 登录请求响应格式
 */
export interface ResponseLogin extends APIResponse {
  data: CurrentUser;
}

/**
 * 发起登录请求。
 * @param uscc 统一社会信用代码
 * @param password 用户密码
 */
export function doLogin(data: { uscc: string; password: string }) {
  return request<ResponseLogin>('/auth/login', { method: 'POST', data });
}

/**
 * 注销请求响应格式
 */
export interface ResponseLogout extends APIResponse {}

/**
 * 发起注销请求。
 */
export function doLogout() {
  return request<ResponseLogout>('/auth/logout');
}
