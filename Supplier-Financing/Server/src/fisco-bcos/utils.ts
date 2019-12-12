import * as path from 'path';
import { Condition, CRUDService, Table, Web3jService } from './packages/api';
import { Configuration } from './packages/api/common/configuration';
import * as utils from './packages/api/common/utils';
import * as web3Utils from './packages/api/common/web3lib/utils';
import * as PEM from './packages/api/node_modules/pem-file';
import { ABIItem, TransactionResult } from './typings';

// 设置 FISCO-BCOS 相关证书。
Configuration.setConfig(path.join(__dirname, './config/config.json'));
// 创建 Web3j 服务。
const web3jService = new Web3jService();

// 智能合约部署地址。
export const CONTRACT_ADDRESS = '0x227fd0df9551102e7f2a14607bf5fe3c21289c18';
// 智能合约 ABI 定义。
export const CONTRACT_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'receiptId', type: 'int256' },
      { name: 'amount', type: 'int256' },
    ],
    name: 'returnCredit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'addr', type: 'address' },
      { name: 'uscc', type: 'string' },
    ],
    name: 'registerCompany',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'addr', type: 'address' },
      { name: 'uscc', type: 'string' },
    ],
    name: 'registerBank',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'debtee', type: 'address' },
      { name: 'amount', type: 'int256' },
      { name: 'deadline', type: 'int256' },
    ],
    name: 'transferCredit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_adminAddr', type: 'address' },
      { name: 'uscc', type: 'string' },
      { name: '_suffix', type: 'string' },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'company_type', type: 'int256' },
      { indexed: false, name: 'addr', type: 'address' },
      { indexed: false, name: 'uscc', type: 'string' },
    ],
    name: 'RegistrationEvent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'from', type: 'address' },
      { indexed: false, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'int256' },
    ],
    name: 'TransactionEvent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'from', type: 'address' },
      { indexed: false, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'int256' },
    ],
    name: 'ReturnEvent',
    type: 'event',
  },
];

// 前缀：-----BEGIN EC PRIVATE KEY-----。
const EC_PRIVATE_KEY_PREFIX = '30740201010420';
// 前缀：-----BEGIN PRIVATE KEY-----
const PRIVATE_KEY_PREFIX =
  '308184020100301006072a8648ce3d020106052b8104000a046d306b0201010420';

/**
 * 从 PEM 证书中解析出私钥字符串内容。
 * @param pem 证书
 */
function decodePem(pem: string): string {
  let privateKey = '';
  if (pem.startsWith(EC_PRIVATE_KEY_PREFIX)) {
    // -----BEGIN EC PRIVATE KEY-----
    privateKey = pem.substring(
      EC_PRIVATE_KEY_PREFIX.length,
      EC_PRIVATE_KEY_PREFIX.length + 64,
    );
  } else if (pem.startsWith(PRIVATE_KEY_PREFIX)) {
    // -----BEGIN PRIVATE KEY-----
    privateKey = pem.substring(
      PRIVATE_KEY_PREFIX.length,
      PRIVATE_KEY_PREFIX.length + 64,
    );
  } else {
    throw new Error('expected `EC PRIVATE KEY` or `PRIVATE KEY`');
  }
  return privateKey;
}

/**
 * 根据 PEM 文本内容计算私钥。
 * @param raw PEM 文件文本内容
 */
export function getPrivateKey(raw: string): string {
  const encodedPem = Buffer.from(raw);
  const decodedPem = (PEM.decode(encodedPem) as Buffer).toString('hex');
  return decodePem(decodedPem);
}

/**
 * 根据私钥生成公钥地址。
 * @param privateKey 私钥
 */
export function privateKeyToPublicKey(privateKey: string): string {
  return `0x${web3Utils.privateKeyToAddress(privateKey).toString('hex')}`;
}

/**
 * 根据传入的公钥和私钥构建和发起智能合约交易。
 * @param address 合约部署地址
 * @param abi 合约 ABI 说明
 * @param publicKey 发送方公钥
 * @param privateKey 发送方私钥
 * @param func 函数名称
 * @param params 函数参数
 */
export function sendRawTransactionUsingCustomCredentials(
  address: string,
  abi: ABIItem[],
  publicKey: string,
  privateKey: string,
  func: string,
  params: (string | number)[],
) {
  let item: ABIItem;
  // 函数签名。
  let funcSignature = '';

  for (const iter of abi) {
    if (iter.name === func && iter.type === 'function') {
      if (iter.inputs.length !== params.length) {
        throw new Error('wrong number of parameters for function');
      }
      item = iter;
      funcSignature = utils.spliceFunctionSignature(iter);
      break;
    }
  }

  return new Promise((resolve: (ret: TransactionResult) => void, reject) => {
    web3jService
      .sendRawTransactionUsingCustomCredentials(
        publicKey,
        privateKey,
        address,
        funcSignature,
        params,
      )
      .then((result: TransactionResult) => {
        const transactionHash: string = result.transactionHash;
        const status: string = result.status;
        const output: string = result.output;
        const ret = {
          transactionHash,
          status,
          output: '',
        };
        if (output !== '0x') {
          ret.output = utils.decodeMethod(item, output);
        }
        resolve(ret);
      })
      .catch(reject);
  });
}

// 创建 CRUD 服务。
const curdService = new CRUDService();

export type TCondition = {
  ne(key: string, value: string): void;
  ge(key: string, value: string): void;
  le(key: string, value: string): void;
  gt(key: string, value: string): void;
  lt(key: string, value: string): void;
  eq(key: string, value: string): void;
};

export function newCondtion(): TCondition {
  return new Condition();
}

export function select(
  tableName: string,
  key: string,
  condition: TCondition,
): Promise<any> {
  return curdService.desc(tableName).then(info => {
    const table = new Table(
      info.tableName,
      key,
      info.valueFields,
      info.optional,
    );
    return curdService.select(table, condition);
  });
}
