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
import { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BlockchainService from '@/services/blockchain';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { generateRandomString } from '@/utils';
import parseConfig from "../parse.json"
import axios from 'axios';

export const UserContext = createContext(()=>{});

export default function App({ Component, pageProps }: any) {

  const [role, setRole] = useState<any[]>([])
  const [forecLogout, setForceLogout] = useState(false)
  const [status, setStatus] = useState(false)

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

  useEffect(() => {
    window.location.pathname == '/login' && role.length == 0 ? setStatus(true) : setStatus(false)
  }, [status, role])
  
  const wagmiConfig = createConfig({
    autoConnect: status ? false : true,
    connectors,
    publicClient
  })
  const [mounted, setMounted] = useState(false);
  const [blockchainService, setBlockchainService] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getToken = async (request: any) => {
		try {
			let data: any = await axios.post(`${parseConfig.publicURL}/auth/login`, request)
			data = data.data
			return {
				token: data?.access_token || '',
				roles: data?.user?.roles || []
			}
		} catch (error) {
			console.log('Error', error);
			return {
					token:'',
					roles:[]
			}
		}
	}

  const onConnect = async (address?: any, connector?: any) => {
    console.log('connected!');
    console.log('address = ' + address);
    console.log('connector = ' + connector);

    console.log("ethereum:");
    console.log((window as any).ethereum);

    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    let RandomString = generateRandomString(10)
    const message = `Sign this message to validate that you are the owner of the account. Random string: ${RandomString}`;
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    let { token, roles }: any = await getToken({
      "message": message,
      "signature": signature
    })
    if (roles.length > 0) {
      setRole([...roles])
    }
    else if (roles.length == 0) {
      toast.error("Sorry You are not Authorized !")
      setForceLogout(true);
    }
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

  const handleForecLogout = () => {
    setForceLogout(false)
  }

  const onDisconnect = () => {
		setRole([])
		setForceLogout(true)
		console.log("disconnected")
	}

  if (!mounted) return <></>;
  const getLayout =
    (Component as any).getLayout || ((page: React.ReactNode) => page);

  return (
    <UserContext.Provider value={onDisconnect}>
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
          <PrivateRoute handleForecLogout={handleForecLogout} forceLogout={forecLogout} role={role} onConnect={onConnect}>
            {getLayout(<Component role={role} service={blockchainService} {...pageProps} onConnect={onConnect} onDisconnect={onDisconnect} />)}
          </PrivateRoute>
        </RainbowKitProvider>
      </WagmiConfig>
    </UserContext.Provider>
  )
}
