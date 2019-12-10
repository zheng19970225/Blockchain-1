import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Anonymous, Authenticated, ReqSession } from '../core/core.decorator';
import { PinoLoggerService } from '../core/core.logger';
import { destroy } from '../utils';
import { RequestLogin, ResponseLogin, ResponseLogout } from './auth.dto';
import { AuthService } from './auth.service';

/**
 * 鉴权
 */
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  /**
   * 用户登录。
   * @param dto 用户登录响应
   */
  @Post('login')
  @Anonymous()
  public async login(
    @ReqSession() session: Express.Session,
    @Body() dto: RequestLogin,
  ) {
    const user = await this.authService.login(dto.uscc, dto.password);
    session!.user = user;
    return new ResponseLogin(user);
  }

  /**
   * 注销用户，清除 Redis 中的 Session 信息。
   */
  @Get('logout')
  @Authenticated()
  public async logout(@ReqSession() session: Express.Session) {
    // 销毁对应 session 信息
    await destroy(session);
    return new ResponseLogout();
  }
}
