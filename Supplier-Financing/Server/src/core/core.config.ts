import { Global, Injectable, Module } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// tslint:disable-next-line:import-name
import * as Config from 'config';
import { SessionOptions } from 'express-session';
import { RedisOptions } from 'ioredis';

export interface IEnv {
  /**
   * Mongo 数据库名称
   */
  MYSQL_NAME: string;
  /**
   * MySQL 数据库地址
   */
  MYSQL_URL: string;
  /**
   * 服务运行端口
   */
  PORT: number;
  /**
   * 跨域配置
   */
  CORS: CorsOptions;
  /**
   * Redis 数据库配置
   */
  REDIS: RedisOptions[];
  /**
   * Session 配置
   */
  SESSION: SessionOptions;
}

type IConfig = Readonly<IEnv> & {
  readonly isDev: boolean;
  readonly isProd: boolean;
};

/**
 * 配置服务
 */
@Injectable()
export class ConfigService {
  public get<K extends keyof IConfig>(key: K): IConfig[K] {
    const { NODE_ENV = 'development' } = process.env;
    if (key === 'isDev') {
      return (NODE_ENV === 'development') as IConfig[K];
    }
    if (key === 'isProd') {
      return (NODE_ENV === 'production') as IConfig[K];
    }
    return Config.get(key);
  }
}

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
