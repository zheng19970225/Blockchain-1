import { Inject, Injectable } from '@nestjs/common';
import { SendTransactionException } from '../core/core.exception';
import { PinoLoggerService } from '../core/core.logger';
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  getPrivateKey,
  newCondtion,
  select,
  sendRawTransactionUsingCustomCredentials,
  TCondition,
} from './utils';

@Injectable()
export class FiscoBcosService {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 根据公钥和私钥发送交易。
   * @param publicKey 公钥地址
   * @param privateKey 私钥文本内容
   * @param func 调用函数的名称
   * @param params 函数参数
   */
  public async sendTransaction(
    publicKey: string,
    privateKey: string,
    func: string,
    params: (string | number)[],
  ) {
    try {
      const ret = await sendRawTransactionUsingCustomCredentials(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        publicKey,
        getPrivateKey(privateKey),
        func,
        params,
      );
      // 交易失败。
      if (ret.status !== '0x0') {
        throw new SendTransactionException(ret);
      }
      return ret;
    } catch (err) {
      this.logger.error(err);
      throw new SendTransactionException(err.toString ? err.toString() : err);
    }
  }

  /**
   * 创建查询条件。
   */
  public crudCondition(): TCondition {
    return newCondtion();
  }

  /**
   * 数据查询。
   * @param tableName 数据表名称
   * @param key 键名称
   * @param condition 查询条件
   */
  public crudSelect(tableName: string, key: string, condition: TCondition) {
    return select(tableName, key, condition);
  }
}
