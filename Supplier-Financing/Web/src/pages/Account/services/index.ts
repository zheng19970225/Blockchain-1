import { TransactionType, UPLOAD_TYPE } from '@/models/user';
import { APIResponse } from '@/types';
import request from '@/utils/request';
import { message } from 'antd';

/**
 * 获取上传预签名响应
 */
interface ResponseFetchUploadSign extends APIResponse {
  data: {
    url: string;
  };
}

/**
 * 获取上传预签名。
 */
export async function doFetchUploadSign(params: { type: UPLOAD_TYPE; ext: string }) {
  const response = await request<ResponseFetchUploadSign>(
    `/user/sign?type=${params.type}&ext=${params.ext}`,
  );
  if (response.code !== 200) {
    message.error('获取上传预签名失败，请重试。');
    return;
  }
  return response.data.url;
}

/**
 * 上传图片响应
 */
interface ResponseUpload {}

/**
 * 上传图片。
 */
export async function doUpload(params: { url: string; file: File }) {
  try {
    const response = await fetch(params.url, { method: 'PUT', body: params.file }).then(res =>
      res.text(),
    );
  } catch (err) {
    // tslint:disable-next-line
    console.error(err);
    message.error('上传失败，请重试');
  }
}

/**
 * 提交商户审核资料响应
 */
interface ResponseSubmitCertification extends APIResponse {}

/**
 * 提交商户审核资料。
 */
export async function doSubmitCertification(params: any) {
  return request<ResponseSubmitCertification>('/user/certification', {
    method: 'POST',
    data: params,
  });
}

/**
 * 发起余额充值响应
 */
export interface ResponseTopUp extends APIResponse {
  data: {
    code_url: string;
  };
}

/**
 * 发起余额充值。
 * @param amount 充值金额
 */
export async function doTopUp(amount: number) {
  return request<ResponseTopUp>('/user/topup', {
    method: 'POST',
    data: { amount },
  });
}

/**
 * 获取用户交易记录响应
 */
export interface ResponseFetchTransactionHistory extends APIResponse {
  data: TransactionType[];
}

/**
 * 获取用户交易记录
 */
export async function doFetchTransactionHistory() {
  return request<ResponseFetchTransactionHistory>('/payment/history');
}

/**
 * 获取金额限制
 */
export interface ResponseFetchMoneyAmountLimit extends APIResponse {
  data: {
    business_publish_job_price: number;
    business_topup_min_amount: number;
  };
}

/**
 * 获取金额限制
 */
export async function doFetchMoneyAmountLimit() {
  return request<ResponseFetchMoneyAmountLimit>('/payment/config');
}
