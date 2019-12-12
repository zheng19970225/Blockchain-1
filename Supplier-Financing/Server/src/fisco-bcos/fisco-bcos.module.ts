import { Module } from '@nestjs/common';
import { FiscoBcosController } from './fisco-bcos.controller';
import { FiscoBcosService } from './fisco-bcos.service';

@Module({
  imports: [],
  controllers: [FiscoBcosController],
  providers: [FiscoBcosService],
  exports: [FiscoBcosService],
})
export class FiscoBcosModule {}
