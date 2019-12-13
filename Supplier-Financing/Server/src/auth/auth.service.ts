import { Inject, Injectable } from '@nestjs/common';
import { PinoLoggerService } from '../core/core.logger';
import { UserService } from '../user/user.service';

/**
 * 鉴权服务
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  /**
   * 用户登录。
   * @param uscc 统一社会信用代码
   * @param password 用户输入密码
   */
  public login(uscc: string, password: string) {
    return this.userService.authenticate(uscc, password);
  }
}
