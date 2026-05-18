// Kite Account Abstraction SDK wrapper
// Docs: https://docs.gokite.ai/kite-chain/account-abstraction-sdk
// Package: gokite-aa-sdk on npm (npm install gokite-aa-sdk)
//
// The AA SDK provides:
//   - ERC-4337 smart contract wallets for AI agents
//   - Upgradeable ClientAgentVault via proxy contracts
//   - Spending rules: budget caps, time windows, whitelisted providers
//   - Gasless transactions via bundler integration
//
// Kite Testnet Addresses (from docs):
//   Settlement Token:        0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63
//   Settlement Contract:     0x8d9FaD78d5Ce247aA01C140798B9558fd64a63E3
//   ClientAgentVault Impl:   0xB5AAFCC6DD4DFc2B80fb8BCcf406E1a2Fd559e23

import { ethers } from 'ethers';

const KITE_TESTNET_RPC     = 'https://rpc-testnet.gokite.ai';
const BUNDLER_RPC          = 'https://bundler-service.staging.gokite.ai/rpc/';
const SETTLEMENT_TOKEN     = '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';
const VAULT_IMPLEMENTATION = '0xB5AAFCC6DD4DFc2B80fb8BCcf406E1a2Fd559e23';
const SETTLEMENT_CONTRACT  = '0x8d9FaD78d5Ce247aA01C140798B9558fd64a63E3';

export interface SpendingRule {
  timeWindow:              bigint;
  budget:                  bigint;
  initialWindowStartTime:  bigint;
  targetProviders:         string[];
}

// The AA SDK type (matches gokite-aa-sdk interface from docs)
interface GokiteAASDKInstance {
  getAccountAddress: (signerAddress: string) => string;
  sendUserOperationAndWait: (
    signerAddress: string,
    request: { target: string; value?: bigint; callData: string },
    signFn: (hash: string) => Promise<string>
  ) => Promise<{ status: { status: string; transactionHash: string; reason?: string } }>;
}

// Initialize SDK — exact constructor from Kite docs
export function initAASDK(): GokiteAASDKInstance | null {
  try {
    // Dynamic require to avoid build errors if gokite-aa-sdk is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GokiteAASDK } = require('gokite-aa-sdk');
    return new GokiteAASDK(
      'kite_testnet',
      KITE_TESTNET_RPC,
      BUNDLER_RPC
    ) as GokiteAASDKInstance;
  } catch {
    console.warn('[AA SDK] gokite-aa-sdk not installed — run: npm install gokite-aa-sdk');
    return null;
  }
}

// Get the AA wallet address for a given EOA signer
export function getAAWalletAddress(signerAddress: string): string {
  const sdk = initAASDK();
  if (!sdk) return `aa_mock_${signerAddress.slice(0, 10)}`;
  return sdk.getAccountAddress(signerAddress);
}

// Create a sign function from a private key (for server-side AA operations)
export function createSignFunction(privateKey: string) {
  const signer = new ethers.Wallet(privateKey);
  return async (userOpHash: string): Promise<string> => {
    return signer.signMessage(ethers.getBytes(userOpHash));
  };
}

// Configure spending rules on a ClientAgentVault
// From Kite AA docs — Configure Spending Rules section
// This is what makes the demo real: on-chain enforcement, not just UI display
export async function configureSpendingRules(
  signerAddress: string,
  proxyAddress: string,
  budgetToken: string,   // e.g. "1.00" = 1 USDC
  providerAddresses: string[],
  signFn: (hash: string) => Promise<string>
): Promise<{ transactionHash: string }> {
  const sdk = initAASDK();
  if (!sdk) throw new Error('gokite-aa-sdk not installed — run: npm install gokite-aa-sdk');

  const startTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const rules: SpendingRule[] = [{
    timeWindow:              3600n,    // 1 hour window (judges see this)
    budget:                  ethers.parseUnits(budgetToken, 18),
    initialWindowStartTime:  startTimestamp,
    targetProviders:         providerAddresses,
  }];

  // ABI for configureSpendingRules — matches ClientAgentVault interface
  const vaultInterface = new ethers.Interface([
    'function configureSpendingRules((uint256 timeWindow, uint256 budget, uint256 initialWindowStartTime, address[] targetProviders)[] rules) external',
  ]);

  const callData = vaultInterface.encodeFunctionData('configureSpendingRules', [rules]);

  const result = await sdk.sendUserOperationAndWait(
    signerAddress,
    {
      target:   proxyAddress,
      value:    0n,
      callData,
    },
    signFn
  );

  if (result.status.status !== 'success') {
    throw new Error(`Vault config failed: ${result.status.reason}`);
  }

  return { transactionHash: result.status.transactionHash };
}

// Read current spending rules from vault (view-only, no gas)
export async function getSpendingRules(proxyAddress: string): Promise<SpendingRule[]> {
  const provider = new ethers.JsonRpcProvider(KITE_TESTNET_RPC);

  const vaultABI = [
    'function getSpendingRules() external view returns ((uint256 timeWindow, uint256 budget, uint256 initialWindowStartTime, address[] targetProviders)[])',
  ];

  const contract = new ethers.Contract(proxyAddress, vaultABI, provider);
  return contract.getSpendingRules();
}

// Check settlement token balance of vault
export async function getVaultBalance(proxyAddress: string): Promise<string> {
  const provider  = new ethers.JsonRpcProvider(KITE_TESTNET_RPC);
  const tokenABI  = ['function balanceOf(address) view returns (uint256)'];
  const token     = new ethers.Contract(SETTLEMENT_TOKEN, tokenABI, provider);
  const balance   = await token.balanceOf(proxyAddress);
  return ethers.formatUnits(balance, 18);
}

// Send a UserOperation via AA bundler (simple ETH transfer example from Kite docs)
export async function sendAATransfer(
  signerAddress: string,
  targetAddress: string,
  valueEth: string,
  signFn: (hash: string) => Promise<string>
): Promise<string> {
  const sdk = initAASDK();
  if (!sdk) throw new Error('gokite-aa-sdk not installed');

  const result = await sdk.sendUserOperationAndWait(
    signerAddress,
    {
      target:   targetAddress,
      value:    ethers.parseEther(valueEth),
      callData: '0x',
    },
    signFn
  );

  if (result.status.status !== 'success') {
    throw new Error(`AA transfer failed: ${result.status.reason}`);
  }

  return result.status.transactionHash;
}
