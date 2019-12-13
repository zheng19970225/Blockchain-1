import { User } from '../src/models/user.model.mysql';

type Overwrite<T, K> = Pick<T, Exclude<keyof T, keyof K>> & K;

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type MakeOptional<T, K> = Omit<T, K> & Partial<T>;

type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never;
type PickAndFlatten<T, K extends keyof T> = UnionToIntersection<T[K]>;

declare global {
  namespace Express {
    interface Session {
      user: User;
    }
  }

  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'grey';
    }
  }
}
