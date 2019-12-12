import { AppCode, Response } from '../core/core.enum';
import { Receipt } from './receipt.service';

/**
 * 获取账户凭据总金额请求
 */
export class RequestTotalReceipts {}

/**
 * 获取账户凭据总金额响应
 */
export class ResponseTotalReceipts extends Response {
  constructor(data: Receipt) {
    super(AppCode.SUCCESS, data);
  }
}

/**
 * 获取账户凭证详情请求
 */
export class RequestDetailReceipts {}

/**
 * 获取账户凭证详情响应
 */
export class ResponseDetailReceipts extends Response {
  constructor(data: Receipt[]) {
    super(AppCode.SUCCESS, data);
  }
}
