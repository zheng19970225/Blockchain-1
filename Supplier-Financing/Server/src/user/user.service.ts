import { Inject, Injectable } from '@nestjs/common';
import { MySQLService } from '../core/core.database';
import {
  SendTransactionException,
  UserNotExistException,
  UserPasswordException,
} from '../core/core.exception';
import { PinoLoggerService } from '../core/core.logger';
import { FiscoBcosService } from '../fisco-bcos/fisco-bcos.service';
import { User } from '../models/user.model.mysql';
import { pagination } from '../utils';

/**
 * 用户类型。
 */
export enum UserType {
  ADMIN_BANK = 1,
  BANK = 2,
  COMPANY = 3,
}

@Injectable()
export class UserService {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
    @Inject(MySQLService) private readonly mysql: MySQLService,
    @Inject(FiscoBcosService) private readonly blockchain: FiscoBcosService,
  ) {}

  /**
   * 通过 USCC 获取用户信息。
   * @param uscc 统一社会信用代码
   */
  public async getInfoByUSCC(uscc: string): Promise<User> {
    const user = await this.mysql.users.findOne({ uscc });
    delete user.password;
    return user;
  }

  /**
   * 验证用户密码。
   * @param uscc 统一社会信用代码
   * @param password 用户输入密码
   */
  public async authenticate(uscc: string, password: string): Promise<User> {
    const user = await this.mysql.users.findOne({ uscc });
    if (!user) {
      throw new UserNotExistException();
    }
    if (password !== user.password) {
      throw new UserPasswordException();
    }
    // 取消用户密码的返回。
    delete user.password;
    return user;
  }

  /**
   * 用户注册。
   * @param uscc 统一社会信用代码
   * @param address 公钥地址
   * @param password 用户密码
   * @param type 用户类型
   * @param publicKey 中央银行或银行的公钥地址
   * @param privateKey 中央银行或银行的私钥文本内容
   */
  public async register(
    uscc: string,
    address: string,
    password: string,
    type: UserType,
    publicKey: string,
    privateKey: string,
  ): Promise<User> {
    // 获取 MySQL 数据库连接句柄
    const runner = await this.mysql.connection.createQueryRunner();
    // 开启事务
    await runner.startTransaction();
    try {
      // 写入平台数据库。
      const user = new User();
      user.uscc = uscc;
      user.address = address;
      user.password = password;
      user.type = type;
      await runner.manager.save<User>(user);
      // 调用智能合约。
      const func =
        type === UserType.BANK
          ? 'registerBank'
          : type === UserType.COMPANY
          ? 'registerCompany'
          : '';
      const ret = await this.blockchain.sendTransaction(
        publicKey,
        privateKey,
        func,
        [address, uscc],
      );
      // 交易失败。
      if (ret.status !== '0x0') {
        throw new SendTransactionException(ret);
      }
      // 提交事务。
      await runner.commitTransaction();
      return user;
    } catch (err) {
      // 回滚事务
      await runner.rollbackTransaction();
      throw err;
    } finally {
      // 释放链接句柄
      await runner.release();
    }
  }

  /**
   * 获取所有的账户信息。
   * @param offset 页偏移
   * @param pageSize 页数据大小
   */
  public async getAllUsers(offset: number = 0, pageSize: number = 20) {
    const newOffset = offset === -1 ? 0 : offset;
    const users = await this.mysql.users.find();
    const list = offset === -1 ? users : pagination(users, offset, pageSize);
    return {
      list,
      total: users.length,
      next: newOffset + list.length,
    };
  }
}
