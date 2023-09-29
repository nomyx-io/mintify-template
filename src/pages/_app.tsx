import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public'
import PrivateRoute from '@/components/atoms/PrivateRoute'
import { useEffect, useState } from 'react';
export default function App({ Component, pageProps }: AppProps) {
  const { chains, publicClient } = configureChains(
    [mainnet, polygon, optimism, arbitrum, base, zora],
    [
      alchemyProvider({ apiKey: 'CSgNtTJ6_Clrf1zNjVp2j1ppfLE2-aVX' }),
      publicProvider()
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: 'LL MIntify',
    projectId: 'ae575761a72370ab88834655acbba677',
    chains
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <></>;
  const getLayout =
    (Component as any).getLayout || ((page: React.ReactNode) => page);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <PrivateRoute>
            {getLayout(<Component {...pageProps} />)}
        </PrivateRoute>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
