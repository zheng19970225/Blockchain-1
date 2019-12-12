const path = require('path');
const { Configuration } = require('./packages/api/common/configuration');
Configuration.setConfig(path.join(__dirname, './config/config.json'));

const { Web3jService } = require('./packages/api');
const web3jService = new Web3jService();

const utils = require('./packages/api/common/utils');

const CONTRACT_ADDRESS = '0x227fd0df9551102e7f2a14607bf5fe3c21289c18';

function sendRawTransaction(
  contractAddress,
  abi,
  account,
  privateKey,
  functionName,
  parameters,
) {
  for (let item of abi) {
    if (item.name === functionName && item.type === 'function') {
      if (item.inputs.length !== parameters.length) {
        throw new Error(
          `wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`,
        );
      }
      functionName = utils.spliceFunctionSignature(item);
      break;
    }
  }

  web3jService
    .sendRawTransactionUsingClientCredentials(
      account,
      privateKey,
      contractAddress,
      functionName,
      parameters,
    )
    .then(result => {
      let txHash = result.transactionHash;
      let status = result.status;
      let ret = {
        transactionHash: txHash,
        status: status,
      };
      let output = result.output;
      if (output !== '0x') {
        ret.output = utils.decodeMethod(item, output);
      }
      console.log(ret);
      return ret;
    })
    .catch(err => {
      console.log(err);
    });
}

const abi = [
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

const EC_PRIVATE_KEY_PREFIX = '30740201010420';
const PRIVATE_KEY_PREFIX =
  '308184020100301006072a8648ce3d020106052b8104000a046d306b0201010420';

function decodePem(pem) {
  let privateKey = null;
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
    throw new ConfigurationError('expected `EC PRIVATE KEY` or `PRIVATE KEY`');
  }
  return privateKey;
}

const fs = require('fs');
const pemFile = require('pem-file');
const encodedPem = fs.readFileSync('./test.pem');
const decodedPem = pemFile.decode(encodedPem).toString('hex');
const privateKey = decodePem(decodedPem);
const web3Utils = require('./packages/api/common/web3lib/utils');
console.log('0x' + web3Utils.privateKeyToAddress(privateKey).toString('hex'));
console.log(privateKey);
sendRawTransaction(
  CONTRACT_ADDRESS,
  abi,
  '0xa02e687623e4252f98b33b05349d07b04d8488a5',
  privateKey,
  'transferCredit',
  ['0x4c2d153d4726a9a3b8b5a66d5d81cd37b780b8f1', 500, 1],
);
