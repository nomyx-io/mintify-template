import config from "../config.json"

import '@/styles/globals.scss'
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
import { ConfigProvider, theme } from "antd";

import {generateRandomString} from '@/utils';
import BlockchainService from '@/services/BlockchainService';
import {WalletAddressProvider} from '@/context/WalletAddressContext';
import PrivateRoute from '@/components/atoms/PrivateRoute'

import NomyxAppContext from "@/context/NomyxAppContext";

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
export const UserContext = createContext(() => {});

const {chains, publicClient} = configureChains(
    [sepolia, localhost],
    [
        alchemyProvider({apiKey: 'CSgNtTJ6_Clrf1zNjVp2j1ppfLE2-aVX'}),
        publicProvider()
    ]
);

const {connectors} = getDefaultWallets({
    appName: 'LL Mintify',
    projectId: 'ae575761a72370ab88834655acbba677',
    chains
});


const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
});

let provider:any;

export default function App({Component, pageProps}: any) {

    const [mounted, setMounted] = useState(false);
    const [blockchainService, setBlockchainService] = useState(null);
    const [role, setRole] = useState<any[]>([]);
    const [forceLogout, setForceLogout] = useState(false);
    const [status, setStatus] = useState(true);

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

        const RandomString = generateRandomString(10);
        let message = `Sign this message to validate that you are the owner of the account. Random string: ${RandomString}`;
        let storedSignature = localStorage.getItem('signature') ? JSON.parse(localStorage.getItem('signature') as string) : null;
        let signature;

        if(!storedSignature){

            try {
                const signer = await provider.getSigner();
                signature = await signer.signMessage(message);
            } catch (error: any) {
                const message = error.reason ? error.reason : error.message
                toast.error(message)
                setForceLogout(true);
            }

        }else{
            signature = storedSignature.signature;
            message = storedSignature.message;
        }

        let {token, roles}: any = await getToken({
            "message": message,
            "signature": signature
        });

        if (roles.length > 0 && roles.includes("CentralAuthority")) {

            setRole([...roles])
            setStatus(false);

            localStorage.setItem('signature', JSON.stringify({
                "message": message,
                "signature": signature
            }));

        } else {

            if (signature) {
                toast.error("Sorry You are not Authorized !")
                setForceLogout(true);
            }

            setStatus(true)
        }

        const _blockchainService: any = BlockchainService.getInstance();
        setBlockchainService(_blockchainService);
        let jsonConfig: any = await import(`../hardhatConfig.json`);

        const network = provider.getNetwork().then(async (network: any) => {

            const chainId = network.chainId;

            console.log('chainId = ' + chainId);

            const config = jsonConfig[chainId];

            if (!config) {
                // setUnsupportedNetworkDialogVisible(true);
                return;
            }
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

    let isDarkMode = true;
    const { defaultAlgorithm, darkAlgorithm } = theme;
    const algorithm = isDarkMode ? darkAlgorithm : defaultAlgorithm;

    let handleLoad = (Component as any).handleLoad;

    if(!handleLoad){
        PubSub.publish("PageLoad");
    }

    return (
        <NomyxAppContext.Provider value={{blockchainService, setBlockchainService}}>
            <UserContext.Provider value={onDisconnect}>
                <WagmiConfig config={wagmiConfig}>
                    <RainbowKitProvider chains={chains} coolMode>
                        <WalletAddressProvider>
                            <ConfigProvider theme={{
                                algorithm,
                                components: {
                                    Layout: {
                                        headerBg: isDarkMode ? "#141414" : "#ffffff",
                                        colorBgBase: isDarkMode ? "#141414" : "#ffffff",
                                        colorBgContainer: isDarkMode ? "#141414" : "#ffffff",
                                        siderBg: isDarkMode ? "#141414" : "#ffffff"
                                    },
                                    Menu: {
                                        activeBarBorderWidth: 0
                                    }
                                }
                            }}>
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
                                        forceLogout={forceLogout}
                                        role={role}
                                        onConnect={onConnect}>
                                        {getLayout(<Component
                                            {...pageProps}
                                            role={role}
                                            service={blockchainService}
                                            onConnect={onConnect}
                                            onDisconnect={onDisconnect}
                                        />)}
                                    </PrivateRoute>
                            </ConfigProvider>
                        </WalletAddressProvider>
                    </RainbowKitProvider>
                </WagmiConfig>
            </UserContext.Provider>
        </NomyxAppContext.Provider>

    );
}
