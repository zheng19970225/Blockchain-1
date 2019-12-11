const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path: string) {
  return reg.test(path);
}

const formatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  return formatter.format(value);
}

/**
 * 延时工具函数
 * @param time 延时时间
 */
export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * 转化 HTTP URL 为 HTTPS URL
 * @param url HTTP URL
 */
export function useHTTPS(url: string) {
  return url.replace(/^http:\/\//i, 'https://');
}
