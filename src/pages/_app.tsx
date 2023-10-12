import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, sepolia, useAccount, WagmiConfig } from 'wagmi';
import {

} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public'
import PrivateRoute from '@/components/atoms/PrivateRoute'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BlockchainService from '@/services/blockchain';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
export default function App({ Component, pageProps }: any) {

  const { chains, publicClient } = configureChains(
    [sepolia],
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
  const [blockchainService, setBlockchainService] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onConnect = async (address?: any, connector?: any) => {
    console.log('connected!');
    console.log('address = ' + address);
    console.log('connector = ' + connector);

    console.log("ethereum:");
    console.log((window as any).ethereum);

    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    let jsonConfig: any = await import(`./../../config.json`);
    const network = provider.getNetwork().then(async (network: any) => {

      const chainId = network.chainId;
      console.log('chainId = ' + chainId);
      setCurrentNetwork(network.chainId);

      const config = jsonConfig[chainId];

      if (!config) {
        // setUnsupportedNetworkDialogVisible(true);
        return;
      }

      const _blockchainService: any = new BlockchainService(provider, config.contract, config.identityFactory);
      setBlockchainService(_blockchainService);
    });
  };

  if (!mounted) return <></>;
  const getLayout =
    (Component as any).getLayout || ((page: React.ReactNode) => page);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} coolMode>
        <ToastContainer
          position='top-right'
          className='toast-background'
          progressClassName='toast-progress-bar'
          autoClose={4000}
          closeOnClick
          pauseOnHover
        />
        <PrivateRoute onConnected={onConnect}>
          {getLayout(<Component service={blockchainService} {...pageProps} onConnect={onConnect} />)}
        </PrivateRoute>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
