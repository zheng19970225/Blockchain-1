import { IEnv } from '../src/core/core.config';

const config: IEnv = {
  MYSQL_NAME: 'supplier_financing',
  MYSQL_URL: 'mysql://root:123456789@127.0.0.1:3306/supplier_financing',
  PORT: 3008,
  CORS: {
    origin: ['http://localhost:3007'],
    credentials: true,
  },
  REDIS: [
    {
      name: 'supplier-financing-server-session',
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      keyPrefix: 's_session__',
      password: '123456789',
    },
  ],
  SESSION: {
    secret: 'supplier-financing-session-secret',
    name: 'supplier-financing-server-session',
    resave: true,
    saveUninitialized: false,
    cookie: {
      domain: 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      signed: true,
      httpOnly: false,
    },
  },
};

export default config;
