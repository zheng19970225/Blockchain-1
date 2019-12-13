import * as asyncHooks from 'async_hooks';

// 维护全局的命名空间
const namespaces: { [name: string]: Namespace } = {};

/**
 * AsyncHooks 命名空间
 */
export class Namespace {
  public context: { [asyncId: string]: Object };

  constructor() {
    this.context = {};
  }

  /**
   * 获取当前 AsyncId 。
   */
  private getCurrentId() {
    return asyncHooks.executionAsyncId();
  }

  /**
   * 设置属于当前 AsyncId 的键名和键值。
   * @param key 键名
   * @param val 键值
   */
  public set(key: string, val: any) {
    const asyncId = this.getCurrentId();
    this.context[asyncId] = this.context[asyncId] || {};
    this.context[asyncId][key] = val;
  }

  /**
   * 获取属于当前 AsyncId 的 key 对应的键值。
   * @param key 键名
   */
  public get(key: string) {
    const asyncId = this.getCurrentId();
    this.context[asyncId] = this.context[asyncId] || {};
    return this.context[asyncId][key];
  }
}

/**
 * 创建指定名称的 AsyncHooks 命名空间。
 * @param name 命名空间名称
 */
export function createNamespace(name: string) {
  if (namespaces[name]) {
    throw new Error(`A namespace for ${name} already exists`);
  }
  const namespace = new Namespace();
  namespaces[name] = namespace;
  // 创建指定命令空间的 AsyncHooks
  createHooks(namespace);
  return namespace;
}

/**
 * 获取指定名称的命名空间。
 * @param name 命名空间名称
 */
export function getNamespace(name: string) {
  return namespaces[name];
}

/**
 * 根据指定命令空间创建 AsyncHooks 。
 * @param namespace 命令空间
 */
function createHooks(namespace: Namespace) {
  // 定义 init 函数
  function init(
    asyncId: number,
    type: string,
    triggerAsyncId: number,
    resource: Object,
  ) {
    // triggerAsyncId 即为 pAsyncId
    if (namespace.context[triggerAsyncId]) {
      namespace.context[asyncId] = namespace.context[triggerAsyncId];
    }
  }
  // 定义 destroy 函数
  function destroy(asyncId: number) {
    if (!namespace.context[asyncId]) {
      return;
    }
    delete namespace.context[asyncId];
  }
  const asyncHook = asyncHooks.createHook({ init, destroy });
  // 开启 AsyncHooks ，关键！
  asyncHook.enable();
}
