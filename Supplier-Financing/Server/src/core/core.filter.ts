import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Module,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppCode } from './core.enum';
import { AppException } from './core.exception';
import { LoggerModule, PinoLoggerService } from './core.logger';

/**
 * 异常处理
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 实现 ExceptionFilter 接口方法。
   * @param exception 异常
   * @param host 请求上下文
   */
  public catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    // 若为业务异常
    if (exception instanceof AppException) {
      this.logger.error('msg: %s', exception.msg);
      // 设置响应的状态码为 200 ，区分因传输造成的错误和因业务造成的错误
      response.status(HttpStatus.OK).json({
        code: AppCode.FAILURE,
        sub: exception.sub,
        msg: exception.msg,
      });
      return;
    }
    // 若为 NotFoundException
    if (exception instanceof NotFoundException) {
      this.logger.error('msg: NotFound Exception');
      response.status(HttpStatus.NOT_FOUND).json(exception.message);
      return;
    }
    // 若为其他异常，打印错误堆栈
    this.logger.error(
      '\nmsg: %s\nstack: %s',
      JSON.stringify(exception.message),
      exception.stack,
    );
    response.status(500).json({
      code: AppCode.INTERNAL_SERVER_ERROR,
      msg: 'Server Internal Error',
    });
  }
}

@Module({
  providers: [LoggerModule, AppExceptionFilter],
  exports: [AppExceptionFilter],
})
export class FilterModule {}
