import { Inject, Injectable, Module, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as uuid from 'uuid';
import { createNamespace, Namespace } from '../utils/context';

/**
 * 上下文服务
 */
@Injectable()
export class ContextService {
  /**
   * 当前上下文
   */
  private static ctx: Namespace;

  constructor() {
    if (ContextService.ctx) {
      return;
    }
    ContextService.ctx = createNamespace('REQUEST_ID');
  }

  /**
   * 获取当前上下文的 RequestID 。
   */
  public getRequestID(): string {
    return ContextService.ctx.get('request_id');
  }

  /**
   * 设置当前上下文的 RequestID 。
   * @param value RequestID
   */
  public setRequestID(value: string) {
    ContextService.ctx.set('request_id', value);
  }
}

/**
 * 请求上下文中间件
 */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(@Inject(ContextService) private readonly ctx: ContextService) {}
  /**
   * 实现 NestMiddleware 接口方法。
   */
  public use(req: Request, res: Response, next: Function) {
    // 设置当前上下文的 RequestID
    this.ctx.setRequestID(uuid());
    next();
  }
}

@Module({
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
