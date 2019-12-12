import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  Authenticated,
  IsAdminBank,
  IsBank,
  ReqUser,
} from '../core/core.decorator';
import { PinoLoggerService } from '../core/core.logger';
import { User } from '../models/user.model.mysql';
import {
  RequestRegister,
  ResponseGetUserInfo,
  ResponseRegister,
} from './user.dto';
import { UserService, UserType } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  /**
   * 获取用户信息。
   */
  @Get()
  @Authenticated()
  public async getInfo(@ReqUser() { uscc }: User) {
    const info = await this.userService.getInfoByUSCC(uscc);
    return new ResponseGetUserInfo(info);
  }

  /**
   * 注册银行。
   * @param dto
   */
  @Post('register/bank')
  @Authenticated()
  @IsAdminBank()
  public async registerBank(@Body() dto: RequestRegister) {
    const user = await this.userService.register(
      dto.uscc,
      dto.address,
      dto.password,
      UserType.BANK,
      dto.publicKey,
      dto.privateKey,
    );
    return new ResponseRegister(user);
  }

  /**
   * 注册公司。
   * @param dto
   */
  @Post('register/company')
  @Authenticated()
  @IsBank()
  public async registerCompany(@Body() dto: RequestRegister) {
    const user = await this.userService.register(
      dto.uscc,
      dto.address,
      dto.password,
      UserType.COMPANY,
      dto.publicKey,
      dto.privateKey,
    );
    return new ResponseRegister(user);
  }
}
