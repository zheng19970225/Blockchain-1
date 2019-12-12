import { Module } from '@nestjs/common';
import { FiscoBcosModule } from '../fisco-bcos/fisco-bcos.module';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';

@Module({
  imports: [FiscoBcosModule],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
