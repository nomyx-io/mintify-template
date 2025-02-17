import "@/styles/globals.scss";
import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

import React, { createContext, ReactElement, ReactNode, useEffect, useState, useCallback } from "react";

import { ConfigProvider, theme } from "antd";
import { Spin } from "antd";
import axios from "axios";
import { BrowserProvider, ethers, Network } from "ethers";
import { NextPage } from "next";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { toast, ToastContainer } from "react-toastify";

import PrivateRoute from "@/components/atoms/PrivateRoute";
import TopNavBar from "@/components/molecules/TopNavBar";
import NomyxAppContext from "@/context/NomyxAppContext";
import Web3Providers from "@/context/Web3Providers";
import BlockchainService from "@/services/BlockchainService";
import { generateRandomString } from "@/utils/regex";

import { UserContext } from "../context/UserContext";
import parseInitialize from "../services/parseInitialize";
import { WalletPreference } from "../utils/constants";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

//export const UserContext = createContext(() => {});

let provider: BrowserProvider;

const validateToken = async (token: string) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/auth/validate`, {
      headers: {
        "x-parse-session-token": token,
      },
    });

    const data = response.data;
    return {
      valid: data?.valid || false,
      roles: data?.user?.roles || [],
      user: data?.user,
      walletPreference: data?.user?.walletPreference,
      dfnsToken: data?.dfnsToken,
    };
  } catch (error) {
    console.error("Error validating token:", error);
    return {
      valid: false,
      roles: [],
      walletPreference: "",
      dfnsToken: null,
    };
  }
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const [mounted, setMounted] = useState(false);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [role, setRole] = useState<string[]>([]);
  const [forceLogout, setForceLogout] = useState(false);
  const [status, setStatus] = useState(true);
  const [user, setUser] = useState(null); // State to hold user
  const [walletPreference, setWalletPreference] = useState<WalletPreference | null>(null);
  const [dfnsToken, setDfnsToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  parseInitialize();

  const getToken = async (request: any) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/auth/login`, request);
      const data = response.data;
      return {
        walletPreference: data?.user?.walletPreference,
        token: data?.access_token || "",
        roles: data?.user?.roles || [],
        user: data?.user,
        dfnsToken: data?.dfns_token,
      };
    } catch (error) {
      console.log("Error during authentication:", error);
      return {
        walletPreference: "",
        token: "",
        roles: [],
        user: null,
        dfnsToken: null,
      };
    }
  };

  const onConnect = useCallback(async () => {
    if (isConnected) {
      return;
    }
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

    let { token, roles, walletPreference, dfnsToken, user } = await getToken({
      message: message,
      signature: signature,
    });
    if (roles.length > 0 && roles.includes("CentralAuthority")) {
      setRole([...roles]);
      setUser(user);
      setStatus(false);
      setWalletPreference(walletPreference);
      setDfnsToken(dfnsToken);
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
        setIsConnected(false);
        return;
      }
      setIsConnected(true);
      parseInitialize();
    });
  }, []);

  const onLogoutEmailPassword = async () => {
    try {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        // Invalidate the session token on the server
        await axios.post(
          `${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/auth/logout`,
          {},
          {
            headers: {
              "x-parse-session-token": token,
            },
          }
        );
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout. Please try again.");
      return;
    }

    // Reset client-side state
    setRole([]);
    setWalletPreference(null);
    setDfnsToken(null);
    setUser(null);
    setForceLogout(false);
    setIsConnected(false);
    localStorage.removeItem("sessionToken");
    //setBlockchainService(null);

    toast.success("Logged out successfully.");
  };

  // Define the onLogin function (Username/Password Login)
  const onLogin = async (email: string, password: string) => {
    const { token, roles, walletPreference, user, dfnsToken } = await getToken({ email, password });

    if (roles.length > 0) {
      setRole([...roles]);
      setUser(user);
      setDfnsToken(dfnsToken);
      setWalletPreference(walletPreference);
      debugger;
      localStorage.setItem("sessionToken", token);
      setIsConnected(true);
      // Initialize blockchainService if required for standard login
      if ((window as any).ethereum) {
        const _blockchainService = BlockchainService.getInstance();
        setBlockchainService(_blockchainService);
      }
      parseInitialize();
    } else {
      toast.error("Sorry, you are not authorized!");
      setForceLogout(true);
    }
  };

  const restoreSession = async () => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      const { valid, roles, walletPreference, user, dfnsToken } = await validateToken(token);
      if (valid && roles.length > 0) {
        setRole(roles);
        setUser(user);
        setDfnsToken(dfnsToken);
        setWalletPreference(walletPreference);
        setIsConnected(true);
      } else {
        // Token is invalid or roles are empty
        localStorage.removeItem("sessionToken");
        setForceLogout(true);
      }
    }
    setInitializing(false);
  };

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (role.length > 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [role]);

  const handleForceLogout = () => {
    setForceLogout(false);
  };

  const onDisconnect = () => {
    setRole([]);
    setForceLogout(true);
    setDfnsToken(null);
    setUser(null);
    setWalletPreference(null);
    setForceLogout(false);
    setIsConnected(false);
    localStorage.removeItem("sessionToken");
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

  if (initializing) {
    return (
      <div className="z-50 h-screen w-screen flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  return (
    <NomyxAppContext.Provider value={{ blockchainService, setBlockchainService }}>
      <UserContext.Provider value={{ role, setRole, walletPreference, setWalletPreference, dfnsToken, setDfnsToken, user, setUser }}>
        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]">
            <Spin />
          </div>
        )}
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
              {isConnected && user && <TopNavBar onDisconnect={onDisconnect} onLogout={onLogoutEmailPassword} />}
              <PrivateRoute
                handleForecLogout={handleForceLogout}
                forceLogout={forceLogout}
                role={role}
                onConnect={onConnect}
                isConnected={isConnected}
              >
                {getLayout(
                  <Component
                    {...pageProps}
                    role={role}
                    service={blockchainService}
                    onConnect={onConnect}
                    onDisconnect={onDisconnect}
                    forceLogout={forceLogout}
                    onLogin={onLogin}
                  />
                )}
              </PrivateRoute>
              {/* {!isConnected && (
                <Component {...pageProps} forceLogout={forceLogout} onConnect={onConnect} onDisconnect={onDisconnect} onLogin={onLogin} />
              )} */}
            </ConfigProvider>
          </NextThemesProvider>
        </Web3Providers>
      </UserContext.Provider>
    </NomyxAppContext.Provider>
  );
}
