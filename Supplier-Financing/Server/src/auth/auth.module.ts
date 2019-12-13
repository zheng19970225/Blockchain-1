import { Module } from '@nestjs/common';
import { ConfigModule } from '../core/core.config';
import { LoggerModule } from '../core/core.logger';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  imports: [ConfigModule, LoggerModule, UserModule],
  providers: [AuthService],
})
export class AuthModule {}
