import config from "../config.json";

import "@/styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import { createContext, ReactElement, ReactNode, useEffect, useState } from "react";
import { BrowserProvider, ethers, Network } from "ethers";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createConfig, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { toast, ToastContainer } from "react-toastify";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { generateRandomString } from "@/utils";
import BlockchainService from "@/services/BlockchainService";
import { WalletAddressProvider } from "@/context/WalletAddressContext";
import PrivateRoute from "@/components/atoms/PrivateRoute";
import PubSub from "pubsub-js";

import NomyxAppContext from "@/context/NomyxAppContext";
import { NextPage } from "next";
import { AppProps } from "next/app";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const localhost: Chain = {
  id: 31337,
  name: "Localhost",
  network: "localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "lETH",
  },
  rpcUrls: {
    default: {
      http: ["http://0.0.0.0:8545/"],
    },
    public: {
      http: ["http://0.0.0.0:8545/"],
    },
  },
  testnet: true,
};
export const UserContext = createContext(() => {});

const baseSep: Chain = {
  id: 84532,
  name: "Base Sepolia",
  network: "basesep",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "bETH",
  },
  rpcUrls: {
    default: {
      http: ["https://base-sepolia.g.alchemy.com/v2/hS_lVzkyS3Uio080pGgNiC0pdagf5iM1"],
    },
    public: {
      http: ["https://base-sepolia.g.alchemy.com/v2/hS_lVzkyS3Uio080pGgNiC0pdagf5iM1"],
    },
  },
  testnet: true,
};
const { chains, publicClient } = configureChains(
  [baseSep, localhost],
  [alchemyProvider({ apiKey: "CSgNtTJ6_Clrf1zNjVp2j1ppfLE2-aVX" }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "LL Mintify",
  projectId: "ae575761a72370ab88834655acbba677",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

let provider: BrowserProvider;

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const [mounted, setMounted] = useState(false);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [role, setRole] = useState<string[]>([]);
  const [forceLogout, setForceLogout] = useState(false);
  const [status, setStatus] = useState(true);

  const getToken = async (request: object): Promise<{ token: string; roles: string[] }> => {
    try {
      const { data } = await axios.post(`${config.serverURL}/auth/login`, request);

      return {
        token: data?.access_token || "",
        roles: data?.user?.roles || [],
      };
    } catch (error) {
      console.log("Error", error);
      return {
        token: "",
        roles: [],
      };
    }
  };

  const onConnect = async () => {
    console.log("connected!");
    console.log("provider = ", provider);

    const RandomString = generateRandomString(10);
    let message = `Sign this message to validate that you are the owner of the account. Random string: ${RandomString}`;
    let storedSignature = localStorage.getItem("signature") ? JSON.parse(localStorage.getItem("signature") as string) : null;
    let signature;

    if (!storedSignature) {
      try {
        const signer = await provider.getSigner();
        signature = await signer.signMessage(message);
      } catch (error) {
        const message = error.reason ? error.reason : error.message;
        toast.error(message);
        setForceLogout(true);
      }
    } else {
      signature = storedSignature.signature;
      message = storedSignature.message;
    }

    let { token, roles } = await getToken({
      message: message,
      signature: signature,
    });

    if (roles.length > 0 && roles.includes("CentralAuthority")) {
      setRole([...roles]);
      setStatus(false);

      localStorage.setItem("sessionToken", token);

      localStorage.setItem(
        "signature",
        JSON.stringify({
          message: message,
          signature: signature,
        })
      );
    } else {
      if (signature) {
        toast.error("Sorry You are not Authorized !");
        setForceLogout(true);
      }

      setStatus(true);
    }

    const _blockchainService = BlockchainService.getInstance();
    setBlockchainService(_blockchainService);
    let jsonConfig: { [key: string]: object } = await import(`../hardhatConfig.json`);

    const network = provider.getNetwork().then(async (network: Network) => {
      const chainId: string = `${network.chainId}`;

      console.log("chainId = " + chainId);

      const config = jsonConfig[chainId];

      if (!config) {
        // setUnsupportedNetworkDialogVisible(true);
        return;
      }
    });
  };

  const handleForceLogout = () => {
    setForceLogout(false);
  };

  const onDisconnect = () => {
    console.log("onDisconnect");
    setRole([]);
    setForceLogout(true);
    console.log("disconnected");
  };

  const getLayout = Component.getLayout || ((page: React.ReactNode) => page);

  useEffect(() => {
    (window.location.pathname == "/login" && role.length == 0) || window.location.pathname == "/" ? setStatus(true) : setStatus(false);
  }, [status, role]);

  useEffect(() => {
    setMounted(true);

    let ethObject: ethers.Eip1193Provider = window.ethereum;

    provider = new ethers.BrowserProvider(ethObject);
  }, []);

  if (!mounted) return <></>;

  let isDarkMode = true;
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const algorithm = isDarkMode ? darkAlgorithm : defaultAlgorithm;

  return (
    <NomyxAppContext.Provider value={{ blockchainService, setBlockchainService }}>
      <UserContext.Provider value={onDisconnect}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} coolMode>
            <NextThemesProvider attribute="class">
              <WalletAddressProvider>
                <ConfigProvider
                  theme={{
                    components: {
                      Menu: {
                        activeBarBorderWidth: 0,
                      },
                    },
                  }}
                >
                  <ToastContainer
                    position="top-right"
                    className="toast-background"
                    progressClassName="toast-progress-bar"
                    autoClose={4000}
                    closeOnClick
                    pauseOnHover
                  />

                  <PrivateRoute handleForecLogout={handleForceLogout} forceLogout={forceLogout} role={role} onConnect={onConnect}>
                    {getLayout(
                      <Component {...pageProps} role={role} service={blockchainService} onConnect={onConnect} onDisconnect={onDisconnect} />
                    )}
                  </PrivateRoute>
                </ConfigProvider>
              </WalletAddressProvider>
            </NextThemesProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </UserContext.Provider>
    </NomyxAppContext.Provider>
  );
}
