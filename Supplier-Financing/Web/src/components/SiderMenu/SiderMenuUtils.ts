import pathToRegexp from 'path-to-regexp';
import { urlToList } from '@/utils/pathTools';
import { MenuDataItem } from '@/types';
import { BaseMenuProps } from './BaseMenu';

/**
 * 扁平化数组
 * [{path:string},{path:string}] => {path1,path2}
 */
export const getFlatMenuKeys = (menuData: MenuDataItem[] = []): string[] => {
  let keys: string[] = [];
  menuData.forEach(item => {
    keys.push(item.path);
    if (item.children) {
      keys = keys.concat(getFlatMenuKeys(item.children));
    }
  });
  return keys;
};

export const getMenuMatches = (flatMenuKeys: string[] = [], path: string): string[] =>
  flatMenuKeys.filter(item => item && pathToRegexp(item).test(path));

/**
 * 获得菜单子节点
 */
export const getDefaultCollapsedSubMenus = (props: BaseMenuProps): string[] => {
  const { location, flatMenuKeys = [] } = props;
  return urlToList(location!.pathname)
    .map(item => getMenuMatches(flatMenuKeys, item)[0])
    .filter(item => item);
};
