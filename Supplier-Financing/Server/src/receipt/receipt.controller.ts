import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Authenticated, ReqUser } from '../core/core.decorator';
import { PinoLoggerService } from '../core/core.logger';
import { User } from '../models/user.model.mysql';
import {
  RequestReturnReceipt,
  RequestTransferReceipt,
  ResponseDetailReceipts,
  ResponseReturnReceipt,
  ResponseTotalReceipts,
  ResponseTransferReceipt,
} from './receipt.dto';
import { ReceiptService } from './receipt.service';

@Controller('receipt')
@Authenticated()
export class ReceiptController {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
    @Inject(ReceiptService) private readonly receiptService: ReceiptService,
  ) {}

  // 查询账户凭证总金额。
  @Get('/')
  public async getTotalReceipts(@ReqUser() user: User) {
    const data = await this.receiptService.selectReceipts(user.address);
    return new ResponseTotalReceipts(data);
  }

  // 查询账户借入凭证详情信息。
  @Get('/in')
  public async getInReceipts(@ReqUser() user: User) {
    const data = await this.receiptService.selectInReceipts(user.address);
    return new ResponseDetailReceipts(data);
  }

  // 查询账户借出凭证详情信息。
  @Get('/out')
  public async getOutReceipts(@ReqUser() user: User) {
    const data = await this.receiptService.selectOutReceipts(user.address);
    return new ResponseDetailReceipts(data);
  }

  // 转移信用凭证。
  @Post('/transfer')
  public async transferReceipt(@Body() dto: RequestTransferReceipt) {
    await this.receiptService.transferReceipt(
      dto.publicKey,
      dto.privateKey,
      dto.debtee,
      dto.amount,
      dto.deadline,
    );
    return new ResponseTransferReceipt();
  }

  // 归还信用凭证。
  @Post('/return')
  public async returnReceipt(@Body() dto: RequestReturnReceipt) {
    await this.receiptService.returnReceipt(
      dto.publicKey,
      dto.privateKey,
      dto.receiptId,
      dto.amount,
    );
    return new ResponseReturnReceipt();
  }
}
