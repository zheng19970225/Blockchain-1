import { formatMessage } from 'umi-plugin-locale';

/**
 * 业务状态码
 */
export enum AppCode {
  /**
   * 请求成功
   */
  SUCCESS = 200,
  /**
   * 请求失败
   */
  FAILURE = 400,
  /**
   * 内部系统错误
   */
  INTERNAL_SERVER_ERROR = 500,
  /**
   * 未鉴权的访问
   */
  UNAUTHORIZED_EXCEPTION = 401,
  /**
   * 参数错误
   */
  ARGUMENT_EXCEPTION = 0,
  /**
   * 用户已登录
   */
  USER_HAS_LOGGED_IN_EXCEPTION = 1,
  /**
   * 用户不存在
   */
  USER_NOT_EXIST_EXCEPTION = 2,
  /**
   * 密码错误
   */
  USER_PASSWORD_EXCEPTION = 3,
  /**
   * 发送交易错误
   */
  SEND_TRANSACTION_EXCEPTION = 4,
}

/**
 * 显示业务码信息。
 * @param sub 业务错误码
 */
export function formatAppCode(sub: AppCode): string {
  switch (sub) {
    case AppCode.USER_HAS_LOGGED_IN_EXCEPTION:
      return formatMessage({ id: 'error.USER_HAS_LOGGED_IN_EXCEPTION' });
    case AppCode.USER_NOT_EXIST_EXCEPTION:
      return formatMessage({ id: 'error.USER_NOT_EXIST_EXCEPTION' });
    case AppCode.USER_PASSWORD_EXCEPTION:
      return formatMessage({ id: 'error.USER_PASSWORD_EXCEPTION' });
    case AppCode.SEND_TRANSACTION_EXCEPTION:
      return formatMessage({ id: 'error.SEND_TRANSACTION_EXCEPTION' });
    default:
      return formatMessage({ id: 'error.UNKNOWN' });
  }
}
