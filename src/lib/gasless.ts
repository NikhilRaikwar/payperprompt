// Kite EIP-3009 Gasless Transfer Library
// Docs: https://docs.gokite.ai/kite-chain/9-gasless-integration
// Reference gist: https://gist.github.com/thor-wong/2438c0e3970e22c75f4302ac2d75ac1b
//
// How it works:
//   1. Fetch supported token metadata (eip712_name, eip712_version, decimals)
//   2. Build EIP-712 TypedData message (TransferWithAuthorization)
//   3. Sign with user wallet (no gas needed from user)
//   4. POST {from, to, value, validAfter, validBefore, tokenAddress, nonce, v, r, s}
//      to https://gasless.gokite.ai/testnet
//   5. Kite relayer broadcasts on-chain — user pays ZERO gas

import { ethers } from 'ethers';

const GASLESS_ENDPOINT = 'https://gasless.gokite.ai';
const PYUSD_TESTNET    = '0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9';

export interface SupportedToken {
  address:                string;
  balance_threshold:      string;
  decimals:               number;
  eip712_name:            string;
  eip712_version:         string;
  minimum_transfer_amount: string;
  name:                   string;
  symbol:                 string;
}

export interface GaslessTransferParams {
  fromPrivateKey: string;
  toAddress:      string;
  amountWei:      bigint;
  network?:       'testnet' | 'mainnet';
}

export interface GaslessTransferResult {
  txHash:  string;
  from:    string;
  to:      string;
  amount:  string;
  network: string;
}

// Fetch token metadata from Kite gasless service
// GET https://gasless.gokite.ai/supported_tokens
export async function getSupportedTokens(): Promise<{ testnet: SupportedToken[]; mainnet: SupportedToken[] }> {
  const res = await fetch(`${GASLESS_ENDPOINT}/supported_tokens`);
  if (!res.ok) throw new Error(`Failed to fetch supported tokens: ${res.statusText}`);
  return res.json();
}

// EIP-3009 gasless transfer using agent private key (server-side)
// From Kite docs — exact implementation from the reference gist
export async function gaslessTransfer(
  params: GaslessTransferParams
): Promise<GaslessTransferResult> {
  const { fromPrivateKey, toAddress, amountWei, network = 'testnet' } = params;

  const rpc = network === 'testnet'
    ? 'https://rpc-testnet.gokite.ai'
    : 'https://rpc.gokite.ai';

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet   = new ethers.Wallet(fromPrivateKey, provider);

  // Fetch live token metadata for correct EIP-712 domain
  const tokenData = await getSupportedTokens();
  const token     = tokenData[network][0]; // PYUSD

  // validBefore must be within 30 seconds per Kite docs
  const latest   = await provider.getBlock('latest');
  if (!latest) throw new Error('Cannot fetch latest block');
  const latestTs = BigInt(latest.timestamp);
  const nowTs    = BigInt(Math.floor(Date.now() / 1000));

  const validAfter  = latestTs - 1n;
  const validBefore = nowTs + 25n;     // 25-second window

  // Cryptographically unique nonce (EIP-3009 requirement — each nonce usable once)
  const nonce = ethers.hexlify(ethers.randomBytes(32));

  // EIP-712 domain — must exactly match token contract's domain separator
  const domain = {
    name:              token.eip712_name,
    version:           token.eip712_version,
    chainId:           network === 'testnet' ? 2368 : 2366,
    verifyingContract: token.address,
  };

  const types = {
    TransferWithAuthorization: [
      { name: 'from',        type: 'address' },
      { name: 'to',          type: 'address' },
      { name: 'value',       type: 'uint256' },
      { name: 'validAfter',  type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce',       type: 'bytes32' },
    ],
  };

  const message = {
    from:        wallet.address,
    to:          toAddress,
    value:       amountWei,
    validAfter,
    validBefore,
    nonce,
  };

  const signature = await wallet.signTypedData(domain, types, message);
  const { v, r, s } = ethers.Signature.from(signature);

  // POST to Kite gasless relayer
  const response = await fetch(`${GASLESS_ENDPOINT}/${network}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:         wallet.address,
      to:           toAddress,
      value:        amountWei.toString(),
      validAfter:   validAfter.toString(),
      validBefore:  validBefore.toString(),
      tokenAddress: token.address,
      nonce,
      v,
      r,
      s,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gasless transfer failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  if (!data.txHash) throw new Error('Gasless relayer returned no txHash');

  return {
    txHash:  data.txHash,
    from:    wallet.address,
    to:      toAddress,
    amount:  ethers.formatUnits(amountWei, token.decimals),
    network,
  };
}

// Frontend helper: EIP-3009 using browser wallet via wagmi walletClient
// Use this in dashboard/page.tsx instead of gaslessTransfer (which needs a private key)
// The wallet signs typed data — MetaMask shows the user exactly what they're authorizing
export async function gaslessTransferFromBrowser(
  walletClient: {
    getAddresses: () => Promise<`0x${string}`[]>;
    signTypedData: (params: {
      account: `0x${string}`;
      domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: `0x${string}`;
      };
      types: {
        TransferWithAuthorization: Array<{ name: string; type: string }>;
      };
      primaryType: string;
      message: {
        from: `0x${string}`;
        to: `0x${string}`;
        value: bigint;
        validAfter: bigint;
        validBefore: bigint;
        nonce: `0x${string}`;
      };
    }) => Promise<`0x${string}`>;
  },
  toAddress: string,
  amountWei: bigint
): Promise<string> {
  const tokenData = await getSupportedTokens();
  const token     = tokenData.testnet[0];

  const nowTs       = BigInt(Math.floor(Date.now() / 1000));
  const validAfter  = nowTs - 5n;
  const validBefore = nowTs + 25n;
  const nonce       = ethers.hexlify(ethers.randomBytes(32)) as `0x${string}`;

  const [account] = await walletClient.getAddresses();

  const signature = await walletClient.signTypedData({
    account,
    domain: {
      name:              token.eip712_name,
      version:           token.eip712_version,
      chainId:           2368,
      verifyingContract: token.address as `0x${string}`,
    },
    types: {
      TransferWithAuthorization: [
        { name: 'from',        type: 'address' },
        { name: 'to',          type: 'address' },
        { name: 'value',       type: 'uint256' },
        { name: 'validAfter',  type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce',       type: 'bytes32' },
      ],
    },
    primaryType: 'TransferWithAuthorization',
    message: {
      from:        account,
      to:          toAddress as `0x${string}`,
      value:       amountWei,
      validAfter,
      validBefore,
      nonce,
    },
  });

  const { v, r, s } = ethers.Signature.from(signature);

  const response = await fetch(`${GASLESS_ENDPOINT}/testnet`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:         account,
      to:           toAddress,
      value:        amountWei.toString(),
      validAfter:   validAfter.toString(),
      validBefore:  validBefore.toString(),
      tokenAddress: token.address,
      nonce,
      v,
      r,
      s,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gasless relay failed: ${err}`);
  }

  const data = await response.json();
  if (!data.txHash) throw new Error('No txHash returned from gasless relay');
  return data.txHash;
}
