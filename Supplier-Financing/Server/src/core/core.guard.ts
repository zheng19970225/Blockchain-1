import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  UnauthorizedException,
  UserHasLoggedInException,
} from '../core/core.exception';
import { UserType } from '../user/user.service';
import {
  AUTH_TYPE,
  AUTH_TYPE_ANONYMOUS,
  AUTH_TYPE_AUTHENTICATED,
  USER_TYPE,
  USER_TYPE_ADMIN_BANK,
  USER_TYPE_BANK,
} from './core.decorator';

/**
 * 鉴权中间件
 * 根据代码中的装饰器类型和 Session 中是否存在 User 来鉴权。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * 实现 CanActivate 接口方法。
   * @param context 请求上下文
   */
  public canActivate(context: ExecutionContext): boolean {
    // 获取 Controller 的装饰器类型
    const auth_type =
      this.reflector.get<string>(AUTH_TYPE, context.getHandler()) ||
      this.reflector.get<string>(AUTH_TYPE, context.getClass());
    // 若无装饰器，则放通请求
    if (!auth_type) {
      return true;
    }
    const req: Request = context.switchToHttp().getRequest();
    const user = req.session!.user;
    // 若装饰器类型为鉴权且 Session 不存在 User ，则阻断请求（未鉴权的访问）
    if (auth_type === AUTH_TYPE_AUTHENTICATED && !user) {
      throw new UnauthorizedException();
    }
    // 若装饰器类型为匿名且 Session 已存在 User ，则阻断请求（用户重复登录）
    if (auth_type === AUTH_TYPE_ANONYMOUS && user) {
      throw new UserHasLoggedInException();
    }
    const user_type =
      this.reflector.get<string>(USER_TYPE, context.getHandler()) ||
      this.reflector.get<string>(USER_TYPE, context.getClass());
    if (!user_type) {
      return true;
    }
    // 若装饰器为央行装饰器，只放行央行请求。
    if (
      user_type === USER_TYPE_ADMIN_BANK &&
      user.type !== UserType.ADMIN_BANK
    ) {
      throw new UnauthorizedException();
    }
    // 若装饰器为普通银行装饰器，只放行普通银行请求。
    if (user_type === USER_TYPE_BANK && user.type !== UserType.BANK) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
