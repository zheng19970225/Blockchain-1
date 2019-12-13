import { SubscriptionAPI } from 'dva';
import React from 'react';

export class Base<P = {}, S = {}> extends React.Component<P & SubscriptionAPI, S> {}

export interface BreadcrumbNameMap {
  [key: string]: MenuItem;
}

export interface MenuItem {
  path: string;
  name: string;
  icon: string;
  hideInMenu: boolean;
  authority: string[];
  component: React.ReactNode;
}

export interface MenuDataItem {
  authority?: string[] | string;
  children?: MenuDataItem[];
  hideChildrenInMenu?: boolean;
  hideInMenu: boolean;
  icon?: string;
  locale?: string;
  name?: string;
  path: string;
  [key: string]: any;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}

/**
 * 通用响应结构
 * @param code 简要状态码
 * @param sub 业务状态码
 * @param msg 响应信息
 */
export interface APIResponse {
  code: number;
  sub: number;
  msg: string;
  data?: any;
}
