# Supplier Financing Server

> 供应链金融服务端

## 安装与运行

```bash
# 安装依赖。
# Server/ 根目录执行。
yarn

# 安装 fisco-bcos nodejs 依赖。
# 以下 6 条命令依次执行。
cd src/fisco-bcos/
yarn
yarn run repoclean
yarn run bootstrap
cd packages/api
yarn

# 开发模式。
# Server/ 根目录执行。
yarn start:dev

# 生产模式。
# Server/ 根目录执行。
yarn start:prod

# 编译
# Server/ 根目录执行。
yarn build

# 格式化代码
# Server/ 根目录执行。
yarn format
```
