import { Inject, Injectable } from '@nestjs/common';
import { UserNotExistException } from '../core/core.exception';
import { PinoLoggerService } from '../core/core.logger';
import { FiscoBcosService } from '../fisco-bcos/fisco-bcos.service';

export interface Receipt {
  addr: string;
  in_receipts: string;
  out_receipts: string;
  type: string;
  uscc: string;
}

@Injectable()
export class ReceiptService {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
    @Inject(FiscoBcosService) private readonly blockchain: FiscoBcosService,
  ) {}

  /**
   * 查询账户凭证总额。
   * @param address 账户公钥地址
   */
  public async selectReceipts(address: string): Promise<Receipt> {
    const condition = this.blockchain.crudCondition();
    condition.eq('addr', address);
    const data: Receipt[] = await this.blockchain.crudSelect(
      't_company',
      address,
      condition,
    );
    if (data.length !== 1) {
      throw new UserNotExistException();
    }
    const ret = data[0];
    delete ret.addr;
    delete ret.type;
    delete ret.uscc;
    return ret;
  }

  /**
   * 查询账户借入凭证详情数据。
   * @param address 账户公钥地址
   */
  public async selectInReceipts(address: string): Promise<Receipt[]> {
    const condition = this.blockchain.crudCondition();
    condition.eq('debtee', address);
    return this.blockchain.crudSelect('t_in_receipt', address, condition);
  }

  /**
   * 查询账户借出凭证详情数据。
   * @param address 账户公钥地址
   */
  public async selectOutReceipts(address: string): Promise<Receipt[]> {
    const condition = this.blockchain.crudCondition();
    condition.eq('debtor', address);
    return this.blockchain.crudSelect('t_out_receipt', address, condition);
  }
}
