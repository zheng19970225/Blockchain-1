import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppCode } from './core.enum';

/**
 * 程序异常
 * @param code 异常状态码 HttpStatus
 * @param sub 业务码
 * @param msg 异常信息
 */
export class AppException extends HttpException {
  public readonly sub: AppCode;
  public readonly msg: string | Object;

  constructor(msg: string | Object, status: HttpStatus, sub: AppCode) {
    super(msg, status);
    this.sub = sub;
    this.msg = msg;
  }
}

/**
 * 参数错误
 */
export class ArgumentException extends AppException {
  constructor(isProd: boolean, message: ValidationError[]) {
    const msg = isProd ? `${message.map(i => i.property).toString()}` : message;
    super(msg, HttpStatus.BAD_REQUEST, AppCode.ARGUMENT_EXCEPTION);
  }
}

/**
 * 用户重复登录
 */
export class UserHasLoggedInException extends AppException {
  constructor() {
    super(
      'User Has Logged In',
      HttpStatus.UNAUTHORIZED,
      AppCode.USER_HAS_LOGGED_IN_EXCEPTION,
    );
  }
}

/**
 * 用户不存在
 */
export class UserNotExistException extends AppException {
  constructor() {
    super(
      'User Not Exist',
      HttpStatus.UNAUTHORIZED,
      AppCode.USER_NOT_EXIST_EXCEPTION,
    );
  }
}

/**
 * 用户密码错误
 */
export class UserPasswordException extends AppException {
  constructor() {
    super(
      'Wrong User Password',
      HttpStatus.UNAUTHORIZED,
      AppCode.USER_PASSWORD_EXCEPTION,
    );
  }
}

/**
 * 未鉴权的访问
 */
export class UnauthorizedException extends AppException {
  constructor() {
    super(
      'Unauthorized Exception',
      HttpStatus.UNAUTHORIZED,
      AppCode.UNAUTHORIZED_EXCEPTION,
    );
  }
}
