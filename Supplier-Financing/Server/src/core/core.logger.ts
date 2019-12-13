import {
  Global,
  Inject,
  Injectable,
  LoggerService,
  Module,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as pino from 'pino';
import { Logger, QueryRunner } from 'typeorm';
import { onHeaders } from '../utils/onHeaders';
import { ConfigModule, ConfigService } from './core.config';
import { ContextModule, ContextService } from './core.context';

/**
 * 初始化日志服务。
 * @param config 程序配置
 */
function initPino(config: ConfigService) {
  return pino({
    prettyPrint: config.get('isDev'),
    level: config.get('isDev') ? 'trace' : 'info',
    base: config.get('isProd') ? { process: process.pid } : null,
  });
}

/**
 * 日志服务
 */
@Injectable()
export class PinoLoggerService implements LoggerService {
  public logger: pino.Logger;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(ContextService) private readonly ctx: ContextService,
  ) {
    this.logger = initPino(config);
  }

  private addRequestId(message: string) {
    return `${this.ctx.getRequestID() || ''} ${message}`;
  }

  public trace(message: string, ...args: any[]): any {
    this.logger.trace(this.addRequestId(message), ...args);
  }

  public debug(message: string, ...args: any[]): any {
    this.logger.debug(this.addRequestId(message), ...args);
  }

  public info(message: string, ...args: any[]): any {
    this.logger.info(this.addRequestId(message), ...args);
  }

  public warn(message: string, ...args: any[]): any {
    this.logger.warn(this.addRequestId(message), ...args);
  }

  public error(message: string, ...args: any[]): any {
    this.logger.error(this.addRequestId(message), ...args);
  }

  public log(message: string, ...args: any[]): any {
    this.logger.info(this.addRequestId(message), ...args);
  }
}

/**
 * 日志中间件
 * 记录请求响应时间。
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 实现 NestMiddleware 接口方法。
   */
  public use(req: Request, res: Response, next: Function) {
    const start = Date.now();
    // 注册请求响应时间计算函数
    onHeaders(res, () => {
      const cost = Date.now() - start;
      this.logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} +${cost}ms`,
      );
    });
    next();
  }
}

/**
 * TypeORM 日志服务
 */
@Injectable()
export class TypeOrmLoggerService implements Logger {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: pino.Logger,
  ) {}

  public logQuery(
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.trace(`typeorm:query ${query}`, parameters || []);
  }

  public logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.error(`typeorm:query ${error}`, {
      query,
      parameters: parameters || [],
    });
  }

  public logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.warn(`typeorm:query slow ${time}`, {
      query,
      parameters,
    });
  }

  public logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    this.logger.info(`typeorm:schema ${message}`);
  }

  public logMigration(message: string, queryRunner?: QueryRunner): any {
    this.logger.info(`typeorm:migration ${message}`);
  }

  public log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ): any {
    switch (level) {
      case 'log':
        this.logger.debug(message);
        break;
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }
}

@Global()
@Module({
  imports: [ConfigModule, ContextModule],
  providers: [PinoLoggerService, TypeOrmLoggerService],
  exports: [PinoLoggerService, TypeOrmLoggerService],
})
export class LoggerModule {}
