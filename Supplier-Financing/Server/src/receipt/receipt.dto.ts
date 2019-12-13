import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
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
export class RequestDetailReceipts {
  @IsOptional()
  @Transform(parseInt)
  @IsInt()
  @IsPositive()
  public pageSize?: number;

  @IsOptional()
  @Transform(parseInt)
  @IsInt()
  public offset?: number;
}

/**
 * 获取账户凭证详情响应
 */
export class ResponseDetailReceipts extends Response {
  constructor(data: { list: Receipt[]; total: number; next: number }) {
    super(AppCode.SUCCESS, data);
  }
}

/**
 * 转移信用凭证请求
 */
export class RequestTransferReceipt {
  @IsString()
  @Length(42, 42)
  public debtee: string;

  @IsInt()
  @IsPositive()
  public amount: number;

  @IsInt()
  @IsPositive()
  public deadline: number;

  @IsString()
  @Length(42, 42)
  public publicKey: string;

  @IsString()
  @IsNotEmpty()
  public privateKey: string;
}

/**
 * 转移信用凭证响应
 */
export class ResponseTransferReceipt extends Response {
  constructor() {
    super(AppCode.SUCCESS, 'Success');
  }
}
