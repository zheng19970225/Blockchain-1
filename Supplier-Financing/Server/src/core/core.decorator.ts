import { createParamDecorator, SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export const AUTH_TYPE = 'auth:type';
export const AUTH_TYPE_ANONYMOUS = 'anonymous';
export const AUTH_TYPE_AUTHENTICATED = 'authenticated';

/**
 * 匿名装饰器
 * 若在 Controller 外添加此装饰器，则只放通未鉴权的请求。
 */
export const Anonymous = () => SetMetadata(AUTH_TYPE, AUTH_TYPE_ANONYMOUS);

/**
 * 鉴权装饰器
 * 若在 Controller 外添加此装饰器，则只放通已鉴权的请求。
 */
export const Authenticated = () =>
  SetMetadata(AUTH_TYPE, AUTH_TYPE_AUTHENTICATED);

export const USER_TYPE = 'user:type';
export const USER_TYPE_ADMIN_BANK = 'admin_bank';
export const USER_TYPE_BANK = 'bank';

/**
 * 央行请求装饰器，只放行央行请求。
 */
export const IsAdminBank = () => SetMetadata(USER_TYPE, USER_TYPE_ADMIN_BANK);

/**
 * 普通银行请求装饰器，只放行普通银行请求。
 */
export const IsBank = () => SetMetadata(USER_TYPE, USER_TYPE_BANK);

/**
 * Session 装饰器
 * 可通过此装饰器获取 Session 信息。
 */
export const ReqSession = createParamDecorator(
  (data, req: Request) => req.session!,
);

/**
 * 用户装饰器
 * 可通过此装饰器获取 Session 中的 User 信息。
 */
export const ReqUser = createParamDecorator(
  (data, req: Request) => req.session!.user,
);
