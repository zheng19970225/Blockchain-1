# Business

> 商家后台前端

## Build Setup

```bash
# 安装依赖
yarn

# 开发模式
yarn start

# 编译构建
yarn build

# 线上运行
# 复制 dist/ 文件夹到 NGINX 静态目录
nginx reload
```

## 注意事项

### 是否开启mock 
在`config/config.ts`里面，注释掉`process.env.MOCK = "none";`,就能够开启mock，取消注释就关闭mock，注释掉之后记得重启一下服务，不然process.env不生效