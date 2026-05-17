'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { type Chain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

export const kiteTestnet = {
  id: 2368,
  name: 'Kite Testnet',
  nativeCurrency: { name: 'KITE', symbol: 'KITE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.gokite.ai'] },
  },
  blockExplorers: {
    default: { name: 'KiteScan', url: 'https://testnet.kitescan.ai' },
  },
} as const satisfies Chain;

const config = createConfig({
  chains: [kiteTestnet],
  transports: {
    [kiteTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#00ff88',
          accentColorForeground: '#030712',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
