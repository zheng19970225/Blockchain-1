import { Inject, Injectable } from '@nestjs/common';
import { MySQLService } from '../core/core.database';
import {
  UserNotExistException,
  UserPasswordException,
} from '../core/core.exception';
import { PinoLoggerService } from '../core/core.logger';
import { User } from '../models/user.model.mysql';

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
   */
  public async register(
    uscc: string,
    address: string,
    password: string,
    type: UserType,
  ): Promise<User> {
    const user = await this.mysql.users.save({ uscc, address, password, type });
    delete user.password;
    return user;
  }
}
