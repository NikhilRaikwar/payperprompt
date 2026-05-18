// Kite chain constants + environment validation
// Import from here — never hardcode chain values anywhere else
// Docs: https://docs.gokite.ai/kite-chain/1-getting-started/network-information

const REQUIRED_PUBLIC = [
  'NEXT_PUBLIC_KITE_RPC',
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_REGISTRY_ADDRESS',
];

const OPTIONAL_SERVER = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'AGENT_PRIVATE_KEY',
  'NEXT_PUBLIC_GOLDSKY_URL',
];

export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[]  = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_PUBLIC) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of OPTIONAL_SERVER) {
    if (!process.env[key] || process.env[key]?.includes('your_')) {
      warnings.push(`${key} not set — running in demo mode`);
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}

// Kite testnet canonical constants — always use these
export const KITE = {
  RPC:              process.env.NEXT_PUBLIC_KITE_RPC        || 'https://rpc-testnet.gokite.ai',
  CHAIN_ID:         parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '2368'),
  EXPLORER:         process.env.NEXT_PUBLIC_EXPLORER        || 'https://testnet.kitescan.ai',
  // PYUSD: primary stablecoin for marketplace payments via EIP-3009 gasless
  PYUSD:            '0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9',
  // AA Settlement token
  SETTLEMENT_TOKEN: '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63',
  SETTLEMENT:       '0x8d9FaD78d5Ce247aA01C140798B9558fd64a63E3',
  VAULT_IMPL:       '0xB5AAFCC6DD4DFc2B80fb8BCcf406E1a2Fd559e23',
  REGISTRY:         process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173',
  BUNDLER:          'https://bundler-service.staging.gokite.ai/rpc/',
  GASLESS:          'https://gasless.gokite.ai',
  FAUCET:           'https://faucet.gokite.ai',
} as const;
