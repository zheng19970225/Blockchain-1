import { NestFactory } from '@nestjs/core';
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import { AppModule } from './app.module';
import { ConfigService } from './core/core.config';
import { AppExceptionFilter } from './core/core.filter';
import { PinoLoggerService } from './core/core.logger';
import { AppValidationPipe } from './core/core.pipe';

// 创建 Session 服务所需要的 Redis 连接
const sessionStore = connectRedis(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  // 设置 Session
  app.use(
    session({
      secret: config.get('SESSION').secret,
      name: config.get('SESSION').name,
      resave: config.get('SESSION').resave,
      saveUninitialized: config.get('SESSION').saveUninitialized,
      cookie: config.get('SESSION').cookie,
      store: new sessionStore(config.get('REDIS')[0]),
    }),
  );
  // 设置跨域
  app.enableCors(config.get('CORS'));
  // 设置日志工具
  app.useLogger(app.get(PinoLoggerService));
  // 设置请求参数检验
  app.useGlobalPipes(app.get(AppValidationPipe));
  // 设置异常处理
  app.useGlobalFilters(app.get(AppExceptionFilter));
  // 设置 URL 前缀
  app.setGlobalPrefix('/api');
  // 在指定端口运行程序
  await app.listen(config.get('PORT'));
}

bootstrap();
