/**
 * 清除 Session 信息
 * @param session Request 对象中的 Session 对象
 */
export function destroy(session: Express.Session): Promise<void> {
  return new Promise((resolve, reject) => {
    session.destroy(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * 数组分页
 * @param arr 需要分页的数组
 * @param begin 起始页，从 0 开始计数
 * @param page 页大小
 */
export function pagination(arr: any[], begin: number, page: number) {
  const { length } = arr;
  const end = begin + page;
  return end >= length ? arr.slice(begin, length) : arr.slice(begin, end);
}
