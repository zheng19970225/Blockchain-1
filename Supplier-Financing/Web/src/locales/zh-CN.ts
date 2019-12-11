import account from './zh-CN/account';
import errors from './zh-CN/errors';
import globalHeader from './zh-CN/globalHeader';
import login from './zh-CN/login';
import menu from './zh-CN/menu';
import settings from './zh-CN/settings';

export default {
  ...globalHeader,
  ...menu,
  ...settings,
  ...login,
  ...account,
  ...errors,
};
