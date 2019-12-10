import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './core/core.config';
import { ContextMiddleware, ContextModule } from './core/core.context';
import { DatabaseModule } from './core/core.database';
import { FilterModule } from './core/core.filter';
import { AuthGuard } from './core/core.guard';
import { LoggerMiddleware, LoggerModule } from './core/core.logger';
import { PipeModule } from './core/core.pipe';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    ContextModule,
    LoggerModule,
    FilterModule,
    PipeModule,
    DatabaseModule,
    AuthModule,
    UserModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ContextMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
