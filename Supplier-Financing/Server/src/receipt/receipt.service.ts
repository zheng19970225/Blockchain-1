import { Inject, Injectable } from '@nestjs/common';
import {
  SendTransactionException,
  UserNotExistException,
} from '../core/core.exception';
import { PinoLoggerService } from '../core/core.logger';
import { FiscoBcosService } from '../fisco-bcos/fisco-bcos.service';
import { pagination } from '../utils';

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
  public async selectInReceipts(
    address: string,
    offset: number = 0,
    pageSize: number = 20,
  ) {
    const condition = this.blockchain.crudCondition();
    condition.eq('debtee', address);
    const receipts: Receipt[] = await this.blockchain.crudSelect(
      't_in_receipt',
      address,
      condition,
    );
    const newOffset = offset === -1 ? 0 : offset;
    const list: Receipt[] =
      offset === -1 ? receipts : pagination(receipts, offset, pageSize);
    return { list, total: receipts.length, next: newOffset + list.length };
  }

  /**
   * 查询账户借出凭证详情数据。
   * @param address 账户公钥地址
   */
  public async selectOutReceipts(
    address: string,
    offset: number = 0,
    pageSize: number = 20,
  ) {
    const condition = this.blockchain.crudCondition();
    condition.eq('debtor', address);
    const receipts: Receipt[] = await this.blockchain.crudSelect(
      't_out_receipt',
      address,
      condition,
    );
    const newOffset = offset === -1 ? 0 : offset;
    const list: Receipt[] =
      offset === -1 ? receipts : pagination(receipts, offset, pageSize);
    return { list, total: receipts.length, next: newOffset + list.length };
  }

  /**
   * 转移信用凭证。
   * @param publicKey debtor 公钥地址
   * @param privateKey debtor 私钥内容
   * @param to debtee 公钥地址
   * @param amount 凭据金额，以分作单位
   * @param deadline 截止日期
   */
  public async transferReceipt(
    publicKey: string,
    privateKey: string,
    to: string,
    amount: number,
    deadline: number,
  ) {
    const ret = await this.blockchain.sendTransaction(
      publicKey,
      privateKey,
      'transferReceipt',
      [to, amount, deadline],
    );
    // 交易失败。
    if (ret.status !== '0x0') {
      throw new SendTransactionException(ret);
    }
  }

  /**
   * 归还信用凭证。
   * @param publicKey 归还者 debtee 的公钥地址
   * @param privateKey 归还者 debtee 的私钥内容
   * @param receiptId 归还凭证标识
   * @param amount 归还金额，以分作单位
   */
  public async returnReceipt(
    publicKey: string,
    privateKey: string,
    receiptId: number,
    amount: number,
  ) {
    const ret = await this.blockchain.sendTransaction(
      publicKey,
      privateKey,
      'returnReceipt',
      [receiptId, amount],
    );
    // 交易失败。
    if (ret.status !== '0x0') {
      throw new SendTransactionException(ret);
    }
  }
}
