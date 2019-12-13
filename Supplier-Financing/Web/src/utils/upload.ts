/**
 * 获取文件的 Base64 字符串。
 * @param img Blob 形式的文件
 */
export function getBase64(img: Blob) {
  return new Promise((resolve: (value: string | ArrayBuffer | null) => void, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.readAsDataURL(img);
  });
}

/**
 * 获取文件扩展名。
 * @param filename 文件名
 */
export function getExt(filename: string) {
  const arr = filename.split('.');
  return arr[arr.length - 1];
}
