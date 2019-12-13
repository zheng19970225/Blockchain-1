import request from '@/utils/request';

/**
 * 查看当前用户信息
 */
export async function doFetchUserInfo() {
  return request('/user');
}
