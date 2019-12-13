import { Response } from 'express';

/**
 * 对 WriteHeader 事件监听，并执行相应函数。
 * @param res Response 对象
 * @param listener 事件响应函数
 */
export function onHeaders(res: Response, listener: Function) {
  res.writeHead = createWriteHead(res.writeHead, listener);
}

/**
 * 注册自定义 WriteHead 事件响应函数，返回新的 writeHead 函数。
 * @param prevWriteHeader 原有的 writeHead 函数
 * @param listener WriteHead 事件的响应函数
 */
function createWriteHead(prevWriteHead: Function, listener: Function) {
  // 防止重入
  let fired = false;
  return function writeHeader(statusCode: number) {
    // this 指 Express.Response
    const args = setWriteHeadHeaders.apply(this, arguments);
    if (!fired) {
      // 设置重入标记
      fired = true;
      listener.call(this);
      // 更新已设置的 statusCode
      if (typeof args[0] === 'number' && this.statusCode !== args[0]) {
        args[0] = this.statusCode;
        args.length = 1;
      }
    }
    return prevWriteHead.apply(this, args);
  };
}

/**
 * 设置 Headers 。
 * @param statusCode 状态码
 */
function setWriteHeadHeaders(statusCode: number) {
  const { length } = arguments;
  const headerIndex = length > 1 && typeof arguments[1] === 'string' ? 2 : 1;
  const headers =
    length >= headerIndex + 1 ? arguments[headerIndex] : undefined;
  // this 指 Express.Response
  // 设置 statusCode
  this.statusCode = statusCode;
  // 设置 headers
  if (Array.isArray(headers)) {
    setHeadersFromArray(this, headers);
  } else if (headers) {
    setHeadersFromObject(this, headers);
  }
  const args = [];
  args.length = Math.min(length, headerIndex);
  for (let i = 0; i < args.length; i++) {
    args[i] = arguments[i];
  }
  return args;
}

/**
 * 根据 Array 设置 Response Header 。
 * @param res Response 对象
 * @param headers Header 数组
 */
function setHeadersFromArray(res: Response, headers: any[]) {
  for (let i = 0; i < headers.length; i++) {
    res.setHeader(headers[i][0], headers[i][1]);
  }
}

/**
 * 根据 Object 设置 Response Header 。
 * @param res Response 对象
 * @param headers Header 对象
 */
function setHeadersFromObject(
  res: Response,
  headers: { [k: string]: string | number | string[] },
) {
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k) {
      res.setHeader(k, headers[k]);
    }
  }
}
