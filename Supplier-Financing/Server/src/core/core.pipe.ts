import { Inject, Module, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigModule, ConfigService } from './core.config';
import { ArgumentException } from './core.exception';

/**
 * 请求参数检验
 */
export class AppValidationPipe extends ValidationPipe {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    super({
      // 设置是否开启详细错误信息提示
      disableErrorMessages: config.get('isProd'),
      exceptionFactory: (errors: ValidationError[]): ArgumentException =>
        new ArgumentException(config.get('isProd'), errors),
    });
  }
}

@Module({
  imports: [ConfigModule],
  providers: [AppValidationPipe],
  exports: [AppValidationPipe],
})
export class PipeModule {}
