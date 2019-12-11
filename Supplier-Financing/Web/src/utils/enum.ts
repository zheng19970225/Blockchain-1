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
}
