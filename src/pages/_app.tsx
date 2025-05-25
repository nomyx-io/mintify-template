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
import ParseClient from "@/services/ParseClient";
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
      walletPreference: null, // Changed from "" to null for consistency
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
  const [user, setUser] = useState(null);
  const [walletPreference, setWalletPreference] = useState<WalletPreference | null>(null);
  const [dfnsToken, setDfnsToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // NEW: Track if context is fully loaded
  const [contextReady, setContextReady] = useState(false);

  const router = useRouter();

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
        walletPreference: null, // Changed from "" to null
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
        return;
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
      // CRITICAL: Set all context states atomically
      setRole([...roles]);
      setUser(user);
      setWalletPreference(walletPreference);
      setDfnsToken(dfnsToken);
      setStatus(false);
      setIsConnected(true);
      setContextReady(true); // Mark context as ready

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
      setContextReady(true); // Even on failure, mark as ready
    }

    const _blockchainService = BlockchainService.getInstance();
    setBlockchainService(_blockchainService);

    if (provider) {
      provider.getNetwork().then(async (network: Network) => {
        const chainId: string = `${network.chainId}`;
        const config = process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID;

        if (!config || config !== chainId) {
          setIsConnected(false);
          return;
        }
        setIsConnected(true);
        parseInitialize();
      });
    }
  }, [isConnected]);

  const onLogoutEmailPassword = async () => {
    try {
      const token = localStorage.getItem("sessionToken");
      if (token) {
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

    // Reset all states atomically
    setRole([]);
    setWalletPreference(null);
    setDfnsToken(null);
    setUser(null);
    setForceLogout(false);
    setIsConnected(false);
    localStorage.removeItem("sessionToken");

    // CRITICAL: Set contextReady to true (not false) for logout state
    setContextReady(true);

    toast.success("Logged out successfully.");
  };

  // Define the onLogin function (Username/Password Login)
  const onLogin = async (email: string, password: string) => {
    console.log("onLogin called with:", { email, password: "***" });

    try {
      const { token, roles, walletPreference, user, dfnsToken } = await getToken({ email, password });

      console.log("getToken result:", {
        token: !!token,
        roles: roles?.length || 0,
        walletPreference,
        user: !!user,
        dfnsToken: !!dfnsToken,
      });

      if (roles.length > 0) {
        console.log("Setting login context...", { user: !!user, walletPreference, dfnsToken: !!dfnsToken });

        // CRITICAL: Set all context states atomically in the correct order
        setRole([...roles]);
        setUser(user);
        setDfnsToken(dfnsToken);
        setWalletPreference(walletPreference);
        setIsConnected(true);
        setContextReady(true); // Mark context as ready

        localStorage.setItem("sessionToken", token);

        // Initialize blockchain service if needed
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const _blockchainService = BlockchainService.getInstance();
          setBlockchainService(_blockchainService);
        }

        ParseClient.initialize(token);
        console.log("Login context set successfully");
      } else {
        // DON'T trigger forceLogout for invalid credentials - just show toast
        console.log("Login failed: no valid roles");
        toast.error("We couldn't verify your login details. Please check your username and password.");
        // Context is already ready, no need to change contextReady state
        throw new Error("Invalid credentials"); // This will be caught and handled by the login component
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Login error in onLogin:", errorMessage);

      // Show error toast if not already shown
      if (!errorMessage.includes("Invalid credentials")) {
        toast.error("Login failed. Please try again.");
      }

      // Re-throw so login component can handle it
      throw error;
    }
  };

  const restoreSession = async () => {
    console.log("Starting session restoration...");

    // Check if we're in browser environment
    if (typeof window === "undefined") {
      setInitializing(false);
      setContextReady(true);
      return;
    }

    const token = localStorage.getItem("sessionToken");
    console.log("Session token exists:", !!token);

    if (token) {
      try {
        console.log("Validating session token...");
        const { valid, roles, walletPreference, user, dfnsToken } = await validateToken(token);
        console.log("Token validation result:", { valid, roles: roles?.length, walletPreference, user: !!user, dfnsToken: !!dfnsToken });

        if (valid && roles.length > 0) {
          console.log("Restoring session context...");

          // CRITICAL: Set all states atomically to prevent hydration mismatches
          setRole(roles);
          setUser(user);
          setDfnsToken(dfnsToken);
          setWalletPreference(walletPreference);
          setIsConnected(true);

          console.log("Session context restored successfully");
        } else {
          console.log("Invalid session, cleaning up...");
          localStorage.removeItem("sessionToken");
          setForceLogout(true);
        }
      } catch (error) {
        console.error("Session restoration error:", error);
        localStorage.removeItem("sessionToken");
        setForceLogout(true);
      }
    } else {
      console.log("No session token found");
    }

    // CRITICAL: Always mark as ready, even if no session
    setContextReady(true);
    setInitializing(false);
    console.log("Session restoration completed");
  };

  // Initialize session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  // Loading effect for role changes
  useEffect(() => {
    if (role.length > 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Reduced from 1000ms

      return () => clearTimeout(timer);
    }
  }, [role]);

  const handleForceLogout = () => {
    setForceLogout(false);
  };

  const onDisconnect = () => {
    console.log("Disconnecting user...");
    setRole([]);
    setDfnsToken(null);
    setUser(null);
    setWalletPreference(null);
    setForceLogout(false);
    setIsConnected(false);
    localStorage.removeItem("sessionToken");

    // CRITICAL: Keep contextReady as true for logged-out state
    setContextReady(true);
  };

  const getLayout = Component.getLayout || ((page: React.ReactNode) => page);

  useEffect(() => {
    const isLoginRoute = window.location.pathname === "/login" || window.location.pathname === "/";
    const hasNoRole = role.length === 0;
    setStatus(isLoginRoute && hasNoRole);
  }, [role]);

  // Client-side mount detection
  useEffect(() => {
    setMounted(true);

    // Initialize ethereum provider
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        let ethObject: ethers.Eip1193Provider = (window as any).ethereum;
        provider = new ethers.BrowserProvider(ethObject);
      } catch (error) {
        console.warn("Error initializing ethereum provider:", error);
      }
    }
  }, []);

  // Don't render anything until mounted (prevents hydration mismatches)
  if (!mounted) {
    return null;
  }

  // Theme configuration
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

  // Show loading screen during initialization
  if (initializing || !contextReady) {
    return (
      <div className="z-50 h-screen w-screen flex justify-center items-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-lg">{initializing ? "Loading application..." : "Preparing user session..."}</div>
        </div>
      </div>
    );
  }

  return (
    <NomyxAppContext.Provider value={{ blockchainService, setBlockchainService }}>
      <UserContext.Provider
        value={{
          role,
          setRole,
          walletPreference,
          setWalletPreference,
          dfnsToken,
          setDfnsToken,
          user,
          setUser,
        }}
      >
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
            </ConfigProvider>
          </NextThemesProvider>
        </Web3Providers>
      </UserContext.Provider>
    </NomyxAppContext.Provider>
  );
}
