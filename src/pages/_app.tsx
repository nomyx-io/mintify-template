import "@/styles/globals.scss";
import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

import React, { createContext, ReactElement, ReactNode, useEffect, useState, useCallback } from "react";

import { ConfigProvider, theme } from "antd";
import axios from "axios";
import { BrowserProvider, ethers, Network } from "ethers";
import { NextPage } from "next";
import { AppProps } from "next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { toast, ToastContainer } from "react-toastify";

import PrivateRoute from "@/components/atoms/PrivateRoute";
import NomyxAppContext from "@/context/NomyxAppContext";
import Web3Providers from "@/context/Web3Providers";
import BlockchainService from "@/services/BlockchainService";
import { generateRandomString } from "@/utils/regex";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export const UserContext = createContext(() => {});

let provider: BrowserProvider;

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const [mounted, setMounted] = useState(false);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [role, setRole] = useState<string[]>([]);
  const [forceLogout, setForceLogout] = useState(false);
  const [status, setStatus] = useState(true);

  const getToken = async (request: object): Promise<{ token: string; roles: string[] }> => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/auth/login`, request);

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

  const onConnect = useCallback(async () => {
    const RandomString = generateRandomString(10);
    let message = `Sign this message to validate that you are the owner of the account. Random string: ${RandomString}`;
    let storedSignature = null;
    if (typeof window !== "undefined") {
      const signature = localStorage.getItem("signature");
      storedSignature = signature ? JSON.parse(signature) : null;
    }
    let signature;

    if (!storedSignature) {
      try {
        const signer = await provider.getSigner();
        signature = await signer.signMessage(message);
      } catch (error: any) {
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

    provider.getNetwork().then(async (network: Network) => {
      const chainId: string = `${network.chainId}`;

      const config = process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID;

      if (!config || config !== chainId) {
        // setUnsupportedNetworkDialogVisible(true);
        return;
      }
    });
  }, []);

  const handleForceLogout = () => {
    setForceLogout(false);
  };

  const onDisconnect = () => {
    setRole([]);
    setForceLogout(true);
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

  const antTheme = {
    algorithm,
    components: {
      Layout: {
        headerBg: isDarkMode ? "#141414" : "#ffffff",
        colorBgBase: isDarkMode ? "#141414" : "#ffffff",
        colorBgContainer: isDarkMode ? "#141414" : "#ffffff",
        siderBg: isDarkMode ? "#141414" : "#ffffff",
      },
      Menu: {
        activeBarBorderWidth: 0,
      },
    },
  };

  return (
    <NomyxAppContext.Provider value={{ blockchainService, setBlockchainService }}>
      <UserContext.Provider value={onDisconnect}>
        <Web3Providers>
          <NextThemesProvider attribute="class">
            <ConfigProvider theme={antTheme}>
              <ToastContainer
                position="top-right"
                className="toast-background"
                progressClassName="toast-progress-bar"
                autoClose={4000}
                closeOnClick
                pauseOnHover
              />

              <PrivateRoute handleForecLogout={handleForceLogout} forceLogout={forceLogout} role={role} onConnect={onConnect}>
                {getLayout(<Component {...pageProps} role={role} service={blockchainService} onConnect={onConnect} onDisconnect={onDisconnect} />)}
              </PrivateRoute>
            </ConfigProvider>
          </NextThemesProvider>
        </Web3Providers>
      </UserContext.Provider>
    </NomyxAppContext.Provider>
  );
}
