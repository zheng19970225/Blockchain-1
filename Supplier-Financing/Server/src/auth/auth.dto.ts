import { IsNotEmpty, IsString } from 'class-validator';
import { AppCode, Response } from '../core/core.enum';
import { User } from '../models/user.model.mysql';

/**
 * 用户登录
 */
export class RequestLogin {
  @IsString()
  @IsNotEmpty()
  public uscc: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}

/**
 * 用户登录响应
 */
export class ResponseLogin extends Response {
  constructor(data: User) {
    super(AppCode.SUCCESS, data);
  }
}

/**
 * 注销请求
 */
export class RequestLogout {}

/**
 * 注销响应
 */
export class ResponseLogout {
  public readonly code: AppCode;

  constructor() {
    this.code = AppCode.SUCCESS;
  }
}
