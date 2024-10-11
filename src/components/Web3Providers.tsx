import { WalletAddressProvider } from '@/context/WalletAddressContext';
import { BASESEP_CHAIN, LOCALHOST_CHAIN } from '@/utils/constants';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createContext, ReactNode } from 'react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';


const localhost = LOCALHOST_CHAIN;
const baseSep = BASESEP_CHAIN;

const { chains, publicClient } = configureChains(
  [baseSep],
  [
    alchemyProvider({ apiKey: 'CSgNtTJ6_Clrf1zNjVp2j1ppfLE2-aVX' }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'LL Mintify', // need to change for Kronos
  projectId: 'ae575761a72370ab88834655acbba677',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const ProviderContext = createContext({});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} coolMode>
        <WalletAddressProvider>
          {children}
        </WalletAddressProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
