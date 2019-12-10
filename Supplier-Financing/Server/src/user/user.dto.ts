import { IsString, Length } from 'class-validator';
import { AppCode, Response } from '../core/core.enum';
import { User } from '../models/user.model.mysql';

/**
 * 获取用户信息请求
 */
export class RequestGetUserInfo {}

/**
 * 获取用户信息响应
 */
export class ResponseGetUserInfo extends Response {
  constructor(data: User) {
    super(AppCode.SUCCESS, data);
  }
}

/**
 * 用户注册请求。
 */
export class RequestRegister {
  @IsString()
  @Length(18, 18)
  public uscc: string;

  @IsString()
  @Length(42, 42)
  public address: string;

  @IsString()
  @Length(6, 128)
  public password: string;
}

/**
 * 用户注册响应。
 */
export class ResponseRegister extends Response {
  constructor(data: User) {
    super(AppCode.SUCCESS, data);
  }
}
