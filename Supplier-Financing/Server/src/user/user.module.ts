import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/core.database';
import { FiscoBcosModule } from '../fisco-bcos/fisco-bcos.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule, FiscoBcosModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
