import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const KITE_RPC         = 'https://rpc-testnet.gokite.ai';
const REGISTRY_ADDRESS = '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173';
const REGISTRY_ABI = [
  'function getAllServices() external view returns ((address provider, string name, string endpoint, uint256 pricePerCall, string[] tags, bool active, uint256 totalCalls)[])',
  'function serviceCount() external view returns (uint256)',
];

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(KITE_RPC);
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

    const [services, count] = await Promise.all([
      registry.getAllServices(),
      registry.serviceCount(),
    ]);

    const formatted = services.map((s: {
      provider: string; name: string; endpoint: string;
      pricePerCall: bigint; tags: string[]; active: boolean; totalCalls: bigint;
    }, i: number) => ({
      id:         i + 1,
      provider:   s.provider,
      name:       s.name,
      endpoint:   s.endpoint,
      priceUsdc:  ethers.formatEther(s.pricePerCall),
      priceWei:   s.pricePerCall.toString(),
      tags:       s.tags,
      active:     s.active,
      totalCalls: s.totalCalls.toString(),
    }));

    return NextResponse.json({
      services:  formatted,
      count:     count.toString(),
      registry:  REGISTRY_ADDRESS,
      network:   'Kite Testnet (2368)',
      explorer:  `https://testnet.kitescan.ai/address/${REGISTRY_ADDRESS}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch registry', services: [] },
      { status: 500 }
    );
  }
}
