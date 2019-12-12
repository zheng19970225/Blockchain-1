import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Authenticated } from '../core/core.decorator';
import { RequestSendTransaction, ResponseSendTransaction } from './fisco-bcos.dto';
import { FiscoBcosService } from './fisco-bcos.service';

@Controller('blockchain')
@Authenticated()
export class FiscoBcosController {
  constructor(
    @Inject(FiscoBcosService) private readonly blockchain: FiscoBcosService,
  ) {}

  @Post('/test')
  public async test(@Body() dto: RequestSendTransaction) {
    const ret = await this.blockchain.sendTransaction(
      dto.publicKey,
      dto.privateKey,
      dto.func,
      dto.params,
    );
    // const ret = dto.privateKey;
    return new ResponseSendTransaction(ret);
  }
}
