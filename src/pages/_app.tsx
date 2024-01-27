import config from "../config.json"

import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import "react-toastify/dist/ReactToastify.css";

import axios from 'axios';
import {createContext, useEffect, useState} from 'react';
import {ethers} from 'ethers';
import {getDefaultWallets, RainbowKitProvider} from '@rainbow-me/rainbowkit';
import {Chain, configureChains, createConfig, sepolia, useAccount, WagmiConfig} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public'
import {toast, ToastContainer} from 'react-toastify';

import {generateRandomString} from '@/utils';
import BlockchainService from '@/services/blockchain';
import {WalletAddressProvider} from '@/context/WalletAddressContext';
import PrivateRoute from '@/components/atoms/PrivateRoute'

export const UserContext = createContext(() => {});

const localhost: Chain = {
    id: 31337,
    name: 'Localhost',
    network: 'localhost',
    nativeCurrency: {
        decimals: 18,
        name: 'Ethereum',
        symbol: 'lETH',
    },
    rpcUrls: {
        default: {
            http: ['http://0.0.0.0:8545/']
        },
        public: {
            http: ['http://0.0.0.0:8545/']
        }
    },
    testnet: true,
};

let provider:any;

export default function App({Component, pageProps}: any) {

    const [mounted, setMounted] = useState(false);
    const [blockchainService, setBlockchainService] = useState(null);
    const [role, setRole] = useState<any[]>([]);
    const [forceLogout, setForceLogout] = useState(false);
    const [status, setStatus] = useState(true);

    const {chains, publicClient} = configureChains(
        [localhost, sepolia],
        [
            alchemyProvider({apiKey: 'CSgNtTJ6_Clrf1zNjVp2j1ppfLE2-aVX'}),
            publicProvider()
        ]
    );

    const {connectors} = getDefaultWallets({
        appName: 'LL MIntify',
        projectId: 'ae575761a72370ab88834655acbba677',
        chains
    });

    const wagmiConfig = createConfig({
        autoConnect: status ? false : true,
        connectors,
        publicClient
    });

    const getToken = async (request: any) => {
        try {
            let data: any = await axios.post(`${config.serverURL}/auth/login`, request)
            data = data.data

            return {
                token: data?.access_token || '',
                roles: data?.user?.roles || []
            }
        } catch (error) {
            console.log('Error', error);
            return {
                token: '',
                roles: []
            }
        }
    }

    const onConnect = async () => {

        console.log('connected!');
        console.log("provider = ", provider);
        console.log("chainId = ", provider?.getNetwork().chainId);

        const RandomString = generateRandomString(10);
        const message = `Sign this message to validate that you are the owner of the account. Random string: ${RandomString}`;
        const signer = await provider.getSigner();

        let signature;

        try {
            signature = await signer.signMessage(message);
        } catch (error: any) {
            const message = error.reason ? error.reason : error.message
            toast.error(message)
            setForceLogout(true);
        }

        let {token, roles}: any = await getToken({
            "message": message,
            "signature": signature
        });

        if (roles.length > 0 && roles.includes("CentralAuthority")) {

            setRole([...roles])
            setStatus(false)

        } else {

            if (signature) {
                toast.error("Sorry You are not Authorized !")
                setForceLogout(true);
            }

            setStatus(true)
        }

        let jsonConfig: any = await import(`../hardhatConfig.json`);

        const network = provider.getNetwork().then(async (network: any) => {

            const chainId = network.chainId;

            console.log('chainId = ' + chainId);

            const config = jsonConfig[chainId];

            if (!config) {
                // setUnsupportedNetworkDialogVisible(true);
                return;
            }

            const _blockchainService: any = new BlockchainService(provider, config.contract);
            setBlockchainService(_blockchainService);

        });
    };

    const handleForceLogout = () => {
        setForceLogout(false)
    }

    const onDisconnect = () => {
        console.log("onDisconnect");
        setRole([]);
        setForceLogout(true);
        console.log("disconnected");
    }

    const getLayout = (Component as any).getLayout || ((page: React.ReactNode) => page);

    useEffect(() => {
        (window.location.pathname == '/login' && role.length == 0) || window.location.pathname == '/' ? setStatus(true) : setStatus(false)
    }, [status, role]);

    useEffect(() => {

        setMounted(true);

        let ethObject = (window as any).ethereum;

        provider = new ethers.BrowserProvider(ethObject);

    }, []);

    if (!mounted) return <></>;

    return (
        <UserContext.Provider value={onDisconnect}>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} coolMode>
                    <WalletAddressProvider>
                        <ToastContainer
                            position='top-right'
                            className='toast-background'
                            progressClassName='toast-progress-bar'
                            autoClose={4000}
                            closeOnClick
                            pauseOnHover
                        />
                        <PrivateRoute
                            handleForecLogout={handleForceLogout}
                            forceLogout={forceLogout} role={role}
                            onConnect={onConnect}>
                                {getLayout(<Component
                                    {...pageProps}
                                    role={role}
                                    service={blockchainService}
                                    onConnect={onConnect}
                                    onDisconnect={onDisconnect}
                                />)}
                        </PrivateRoute>
                    </WalletAddressProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </UserContext.Provider>
    );
}
