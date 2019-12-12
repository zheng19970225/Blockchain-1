import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';
import { AppCode, Response } from '../core/core.enum';

/**
 * 发起交易请求
 */
export class RequestSendTransaction {
  @IsString()
  @Length(42, 42)
  public publicKey: string;

  @IsString()
  @IsNotEmpty()
  public privateKey: string;

  @IsArray()
  public params: (string | number)[];
}

/**
 * 发起交易响应
 */
export class ResponseSendTransaction extends Response {
  constructor(data: any) {
    super(AppCode.SUCCESS, data);
  }
}
