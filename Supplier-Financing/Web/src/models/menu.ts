import { MenuDataItem, Route } from '@/types';
import Authorized from '@/utils/Authorized';
import { Effect } from 'dva';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import { Reducer } from 'redux';
import { formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types';

const { check } = Authorized;

// Conversion router to menu.
function formatter(
  data: Route[],
  parentAuthority?: string | string[],
  parentName?: string,
): MenuDataItem[] {
  return data
    .filter(item => item.name && item.path)
    .map(item => {
      const locale = `${parentName || 'menu'}.${item.name}`;
      const result = {
        ...item,
        name: formatMessage({ id: locale, defaultMessage: item.name }),
        locale,
        authority: item.authority || parentAuthority,
      };
      if (item.routes) {
        const children = formatter(item.routes, item.authority, locale);
        result.children = children;
      }
      return result;
    })
    .filter(item => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

/**
 * get SubMenu or Item
 */
const getSubMenu: (item: MenuDataItem) => MenuDataItem = item => {
  if (
    Array.isArray(item.children) &&
    !item.hideChildrenInMenu &&
    item.children.some(child => !!child.name)
  ) {
    return {
      ...item,
      children: filterMenuData(item.children),
    };
  }
  return item;
};

/**
 * filter menuData
 */
const filterMenuData: (menuData: MenuDataItem[]) => MenuDataItem[] = (menuData = []) => {
  return menuData
    .filter(item => item.name && !item.hideInMenu)
    .map(item => check<any, any>(item.authority!, getSubMenu(item), null))
    .filter(item => item);
};
/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 */
const getBreadcrumbNameMap = (menuData: MenuDataItem[]): { [key: string]: MenuDataItem } => {
  const routerMap: { [key: string]: MenuDataItem } = {};
  const flattenMenuData: (data: MenuDataItem[]) => void = data => {
    data.forEach(menuItem => {
      if (menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      routerMap[menuItem.path] = menuItem;
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(getBreadcrumbNameMap, isEqual);

export interface MenuModelState {
  menuData: MenuDataItem[];
  routerData: IRoute[];
  breadcrumbNameMap: object;
}

export interface MenuModelType {
  namespace: 'menu';
  state: MenuModelState;
  effects: {
    getMenuData: Effect;
  };
  reducers: {
    save: Reducer<MenuModelState>;
  };
}

const MenuModel: MenuModelType = {
  namespace: 'menu',

  state: {
    menuData: [],
    routerData: [],
    breadcrumbNameMap: {},
  },

  effects: {
    *getMenuData({ payload }, { put }) {
      const { routes, authority } = payload;
      const menuData = filterMenuData(memoizeOneFormatter(routes, authority));
      const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(menuData);
      yield put({
        type: 'save',
        payload: { menuData, breadcrumbNameMap, routerData: routes },
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

export default MenuModel;
