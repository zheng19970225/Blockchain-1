import { APIResponse } from '@/types';
import request from '@/utils/request';

/**
 * 注销请求响应格式
 */
export interface ResponseLogout extends APIResponse {}

/**
 * 发起登录请求，仅用于开发测试目的。
 */
export function doLoginForDevelopment(params: { uid: number }) {
  return request(`/auth/test?uid=${params.uid}`);
}

/**
 * 发起注销请求
 */
export function doLogout() {
  return request<ResponseLogout>('/auth/logout');
}
