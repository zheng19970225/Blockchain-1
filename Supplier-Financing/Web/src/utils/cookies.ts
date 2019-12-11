/**
 * 清除 cookies 。
 */
export function deleteAllCookies() {
  const keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (!keys) return;
  for (let i = keys.length; i--; ) {
    document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
  }
}
