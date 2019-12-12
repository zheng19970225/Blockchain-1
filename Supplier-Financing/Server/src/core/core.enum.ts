/**
 * 业务响应
 */
export class Response {
  /**
   * 响应状态码
   */
  public code: AppCode;
  /**
   * 业务响应数据
   */
  public data: any;
  /**
   * 业务响应码
   */
  public sub: AppCode;
  /**
   * 业务响应消息
   */
  public msg: string;

  constructor(code: AppCode, data: any, sub?: AppCode, msg?: string) {
    this.code = code;
    this.data = data;
    this.sub = sub;
    this.msg = msg;
  }
}

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
