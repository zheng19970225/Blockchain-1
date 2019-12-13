export interface ABIItem {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: ABIInput[];
  name?: string;
  outputs?: ABIOutput[];
  payable?: boolean;
  stateMutability?: string | 'pure' | 'view' | 'nonpayable' | 'payable';
  type: string | 'function' | 'constructor' | 'event' | 'fallback';
}

export interface ABIInput {
  name: string;
  type: string;
  indexed?: boolean;
  components?: ABIInput[];
}

export interface ABIOutput {
  name: string;
  type: string;
  components?: ABIOutput[];
  internalType?: string;
}

export interface TransactionResult {
  transactionHash: string;
  status: string;
  output?: string;
}
