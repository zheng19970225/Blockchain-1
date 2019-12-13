import { Module } from '@nestjs/common';
import { FiscoBcosService } from './fisco-bcos.service';

@Module({
  imports: [],
  providers: [FiscoBcosService],
  exports: [FiscoBcosService],
})
export class FiscoBcosModule {}
