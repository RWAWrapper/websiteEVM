import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { publicActions } from 'viem';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RWA Wrapper',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJEXT_ID as string,
  chains: [
    // mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    sepolia,
  ],
  ssr: true,
});

export const publicClient = config.getClient().extend(publicActions);