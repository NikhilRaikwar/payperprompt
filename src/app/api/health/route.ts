import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { validateEnv } from '@/lib/env';

const KITE_RPC         = 'https://rpc-testnet.gokite.ai';
const REGISTRY_ADDRESS = '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173';
const GASLESS_URL      = 'https://gasless.gokite.ai/supported_tokens';

export async function GET() {
  const { valid, missing, warnings } = validateEnv();

  let chainStatus = 'unknown';
  let blockNumber = 0;
  let registryOk  = false;

  try {
    const provider = new ethers.JsonRpcProvider(KITE_RPC);
    blockNumber    = await provider.getBlockNumber();
    chainStatus    = 'connected';
    const code     = await provider.getCode(REGISTRY_ADDRESS);
    registryOk     = code !== '0x';
  } catch {
    chainStatus = 'error';
  }

  let gaslessOk = false;
  try {
    const res = await fetch(GASLESS_URL);
    gaslessOk = res.ok;
  } catch { /* ignore */ }

  return NextResponse.json({
    status:    valid && chainStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    kite: {
      network:    'Kite Testnet',
      chainId:    2368,
      rpc:        KITE_RPC,
      explorer:   'https://testnet.kitescan.ai',
      status:     chainStatus,
      blockNumber,
    },
    services: {
      registry: { address: REGISTRY_ADDRESS, deployed: registryOk },
      gasless:  { endpoint: 'https://gasless.gokite.ai', reachable: gaslessOk },
    },
    contracts: {
      pyusd:          '0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9',
      settlementToken: '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63',
      vaultImpl:      '0xB5AAFCC6DD4DFc2B80fb8BCcf406E1a2Fd559e23',
    },
    env: { valid, missing, warnings },
    version: '0.2.0',
  });
}
