import { Injectable, Module } from '@nestjs/common';
import {
  InjectConnection,
  InjectRepository,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { sync as glob } from 'globby';
import { join } from 'path';
import { Connection, Repository } from 'typeorm';
import { User } from '../models/user.model.mysql';
import { ConfigModule, ConfigService } from './core.config';
import { LoggerModule, TypeOrmLoggerService } from './core.logger';

/**
 * MySQL 数据库服务
 */
@Injectable()
export class MySQLService {
  constructor(
    @InjectConnection('mysql') public readonly connection: Connection,
    @InjectRepository(User, 'mysql') public readonly users: Repository<User>,
  ) {}
}

/**
 * 读取数据库 Model 。
 */
const requireClassSync = (base: string, paths: string[], patterns: string[]) =>
  glob(
    paths.map(p => join(base, p)),
    {
      expandDirectories: patterns,
    },
  )
    .map(file => require(file))
    .map((e: object) => Object.values(e).filter(o => typeof o === 'function'))
    .reduce((pv, cv) => pv.concat(cv), []);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'mysql',
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, TypeOrmLoggerService],
      useFactory: (config: ConfigService, logger: TypeOrmLoggerService) => {
        return {
          logger,
          type: 'mysql',
          url: config.get('MYSQL_URL'),
          database: config.get('MYSQL_NAME'),
          synchronize: false, // 关闭数据库同步
          logging: true,
          entities: [`${__dirname}/../models/*.mysql{.ts,.js}`],
        };
      },
    }),
    TypeOrmModule.forFeature(
      requireClassSync(__dirname, ['../models'], ['*.mysql.ts', '*.mysql.js']),
      'mysql',
    ),
  ],
  providers: [MySQLService],
  exports: [TypeOrmModule, MySQLService],
})
export class DatabaseModule {}
