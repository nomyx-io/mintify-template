import "@/styles/globals.scss";
import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

import React, { createContext, ReactElement, ReactNode, useEffect, useState, useCallback, useRef } from "react";

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

// Enhanced logging utility for production debugging
const logRouterAction = (action: string, details: any = {}) => {
  const timestamp = new Date().toISOString();
  const stack = new Error().stack?.split("\n").slice(1, 4); // Get caller stack
  const logData = {
    timestamp,
    action,
    url: typeof window !== "undefined" ? window.location.href : "SSR",
    pathname: typeof window !== "undefined" ? window.location.pathname : "SSR",
    stack: stack?.[0], // Show immediate caller
    ...details,
  };

  console.log(`[ROUTER ${action.toUpperCase()}]`, logData);

  // In production, you might want to send this to your logging service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to your logging endpoint
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type: 'router', ...logData })
    // }).catch(console.error);
  }
};

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

const initializeBlockchainService = async () => {
  try {
    const service = BlockchainService.getInstance();
    if (!service) return null;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    return service;
  } catch (error) {
    console.warn("BlockchainService initialization failed:", error);
    return null;
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeChangeCount, setRouteChangeCount] = useState(0);
  const router = useRouter();

  // Track duplicate route change attempts
  const routeChangeRef = useRef<{ url: string; timestamp: number } | null>(null);
  const pendingNavigationRef = useRef<string | null>(null);

  // Custom router push to prevent duplicates
  const safePush = useCallback(
    (url: string, reason: string) => {
      if (pendingNavigationRef.current === url) {
        logRouterAction("DUPLICATE_NAVIGATION_PREVENTED", {
          url,
          reason,
          pendingUrl: pendingNavigationRef.current,
        });
        return;
      }

      if (isNavigating) {
        logRouterAction("NAVIGATION_BLOCKED_BUSY", {
          url,
          reason,
          currentlyNavigating: isNavigating,
        });
        return;
      }

      pendingNavigationRef.current = url;
      logRouterAction("SAFE_NAVIGATION_START", { url, reason });

      router.push(url).finally(() => {
        pendingNavigationRef.current = null;
      });
    },
    [router, isNavigating]
  );

  // Enhanced router event logging with duplicate detection
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      const now = Date.now();
      const lastChange = routeChangeRef.current;

      // Check for duplicate route change within 50ms
      const isDuplicate = lastChange && lastChange.url === url && now - lastChange.timestamp < 50;

      routeChangeRef.current = { url, timestamp: now };
      setRouteChangeCount((prev) => prev + 1);

      logRouterAction("ROUTE_CHANGE_START", {
        targetUrl: url,
        currentUrl: window.location.href,
        userRole: role,
        isConnected,
        hasUser: !!user,
        isNavigating,
        isDuplicate,
        routeChangeCount: routeChangeCount + 1,
        timeSinceLastChange: lastChange ? now - lastChange.timestamp : 0,
      });

      if (isDuplicate) {
        logRouterAction("DUPLICATE_ROUTE_DETECTED", {
          url,
          timeDiff: now - lastChange!.timestamp,
          routeChangeCount,
        });
      }

      setIsNavigating(true);
    };

    const handleRouteChangeComplete = (url: string) => {
      logRouterAction("ROUTE_CHANGE_COMPLETE", {
        newUrl: url,
        userRole: role,
        isConnected,
        hasUser: !!user,
      });
      setIsNavigating(false);
    };

    const handleRouteChangeError = (err: any, url: string) => {
      logRouterAction("ROUTE_CHANGE_ERROR", {
        error: err.message || err,
        targetUrl: url,
        stack: err.stack,
        userRole: role,
        isConnected,
        hasUser: !!user,
      });
      setIsNavigating(false);
    };

    const handleBeforeHistoryChange = (url: string) => {
      logRouterAction("BEFORE_HISTORY_CHANGE", {
        targetUrl: url,
        currentUrl: window.location.href,
        userRole: role,
        isConnected,
        hasUser: !!user,
      });
    };

    // Log initial route on mount with detailed environment info
    if (mounted) {
      logRouterAction("APP_MOUNTED", {
        initialRoute: router.asPath,
        query: router.query,
        isReady: router.isReady,
        userRole: role,
        isConnected,
        hasUser: !!user,
        nodeEnv: process.env.NODE_ENV,
        isStrictMode: typeof window !== "undefined" && window.React && window.React.version,
        routeChangeCount,
      });
    }

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);
    router.events.on("beforeHistoryChange", handleBeforeHistoryChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
      router.events.off("beforeHistoryChange", handleBeforeHistoryChange);
    };
  }, [router, role, isConnected, user, mounted]);

  // Log authentication state changes with redirect prevention
  useEffect(() => {
    logRouterAction("AUTH_STATE_CHANGE", {
      role,
      isConnected,
      hasUser: !!user,
      currentPath: router.asPath,
      forceLogout,
      initializing,
      isNavigating,
    });
  }, [role, isConnected, user, forceLogout, initializing, isNavigating]);

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
    logRouterAction("WALLET_CONNECT_START", {
      isConnected,
      currentPath: router.asPath,
      hasProvider: !!provider,
    });

    if (isConnected) {
      logRouterAction("WALLET_CONNECT_SKIP", { reason: "Already connected" });
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
        logRouterAction("WALLET_SIGNATURE_SUCCESS", { hasSignature: !!signature });
      } catch (error: any) {
        const message = error.reason ? error.reason : error.message;
        logRouterAction("WALLET_SIGNATURE_ERROR", { error: message });
        toast.error(message);
        setForceLogout(true);
        return;
      }
    } else {
      signature = storedSignature.signature;
      message = storedSignature.message;
      logRouterAction("WALLET_SIGNATURE_REUSED", { hasStoredSignature: true });
    }

    let { token, roles, walletPreference, dfnsToken, user } = await getToken({
      message: message,
      signature: signature,
    });

    logRouterAction("TOKEN_VALIDATION_RESULT", {
      hasToken: !!token,
      rolesCount: roles.length,
      hasAuthority: roles.includes("CentralAuthority"),
      currentPath: router.asPath,
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

      logRouterAction("AUTH_SUCCESS", {
        roles,
        currentPath: router.asPath,
        redirectNeeded: router.asPath === "/login",
      });
    } else {
      if (signature) {
        toast.error("Sorry You are not Authorized !");
        setForceLogout(true);
        logRouterAction("AUTH_UNAUTHORIZED", {
          roles,
          currentPath: router.asPath,
        });
      }
      setStatus(true);
    }

    const _blockchainService = BlockchainService.getInstance();
    setBlockchainService(_blockchainService);

    provider.getNetwork().then(async (network: Network) => {
      const chainId: string = `${network.chainId}`;
      const config = process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID;

      logRouterAction("NETWORK_CHECK", {
        chainId,
        expectedChainId: config,
        isSupported: config === chainId,
        currentPath: router.asPath,
      });

      if (!config || config !== chainId) {
        setIsConnected(false);
        logRouterAction("NETWORK_UNSUPPORTED", { chainId, expectedChainId: config });
        return;
      }

      setIsConnected(true);
      parseInitialize();
      logRouterAction("WALLET_CONNECT_COMPLETE", { currentPath: router.asPath });
    });
  }, [isConnected, router]);

  const onLogoutEmailPassword = async () => {
    logRouterAction("LOGOUT_START", {
      currentPath: router.asPath,
      hasSessionToken: !!localStorage.getItem("sessionToken"),
    });

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
        logRouterAction("LOGOUT_SERVER_SUCCESS");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      logRouterAction("LOGOUT_SERVER_ERROR", { error: error });
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

    logRouterAction("LOGOUT_COMPLETE", {
      currentPath: router.asPath,
      shouldRedirect: router.asPath !== "/login",
    });

    toast.success("Logged out successfully.");

    // Redirect to login if not already there
    if (router.asPath !== "/login" && !isNavigating) {
      logRouterAction("LOGOUT_REDIRECT", { from: router.asPath, to: "/login" });
      safePush("/login", "logout redirect");
    }
  };

  const onLogin = async (email: string, password: string) => {
    logRouterAction("EMAIL_LOGIN_START", {
      email,
      currentPath: router.asPath,
    });

    const { token, roles, walletPreference, user, dfnsToken } = await getToken({ email, password });

    logRouterAction("EMAIL_LOGIN_RESULT", {
      hasToken: !!token,
      rolesCount: roles.length,
      hasUser: !!user,
      currentPath: router.asPath,
    });

    if (roles.length > 0) {
      setRole([...roles]);
      setUser(user);
      setDfnsToken(dfnsToken);
      setWalletPreference(walletPreference);
      localStorage.setItem("sessionToken", token);
      setIsConnected(true);

      const service = await initializeBlockchainService();
      if (service) {
        setBlockchainService(service);
      }

      ParseClient.initialize(token);

      logRouterAction("EMAIL_LOGIN_SUCCESS", {
        roles,
        currentPath: router.asPath,
        shouldRedirect: router.asPath === "/login",
      });

      // Redirect from login page after successful login
      if (router.asPath === "/login" && !isNavigating) {
        logRouterAction("LOGIN_REDIRECT", { from: "/login", to: "/" });
        safePush("/", "email login success");
      }
    } else {
      toast.error("We couldn't verify your login details. Please check your username and password.");
      setForceLogout(true);
      logRouterAction("EMAIL_LOGIN_FAILED", { currentPath: router.asPath });
    }
  };

  const restoreSession = async () => {
    logRouterAction("SESSION_RESTORE_START", {
      currentPath: router.asPath,
      hasStoredToken: !!localStorage.getItem("sessionToken"),
    });

    const token = localStorage.getItem("sessionToken");
    if (token) {
      const { valid, roles, walletPreference, user, dfnsToken } = await validateToken(token);

      logRouterAction("SESSION_VALIDATION_RESULT", {
        valid,
        rolesCount: roles.length,
        hasUser: !!user,
        currentPath: router.asPath,
      });

      if (valid && roles.length > 0) {
        setRole(roles);
        setUser(user);
        setDfnsToken(dfnsToken);
        setWalletPreference(walletPreference);
        setIsConnected(true);

        const service = await initializeBlockchainService();
        if (service) {
          setBlockchainService(service);
        }

        logRouterAction("SESSION_RESTORE_SUCCESS", {
          roles,
          currentPath: router.asPath,
        });
      } else {
        localStorage.removeItem("sessionToken");
        setForceLogout(true);
        logRouterAction("SESSION_RESTORE_FAILED", {
          reason: !valid ? "Invalid token" : "No roles",
          currentPath: router.asPath,
        });
      }
    }
    setInitializing(false);
    logRouterAction("SESSION_RESTORE_COMPLETE", { currentPath: router.asPath });
  };

  useEffect(() => {
    restoreSession();
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
    logRouterAction("FORCE_LOGOUT_HANDLED", { currentPath: router.asPath });
    setForceLogout(false);
  };

  const onDisconnect = () => {
    logRouterAction("DISCONNECT_START", { currentPath: router.asPath });

    setRole([]);
    setForceLogout(true);
    setDfnsToken(null);
    setUser(null);
    setWalletPreference(null);
    setForceLogout(false);
    setIsConnected(false);
    localStorage.removeItem("sessionToken");

    logRouterAction("DISCONNECT_COMPLETE", {
      currentPath: router.asPath,
      shouldRedirect: router.asPath !== "/login",
    });

    // Redirect to login if not already there
    if (router.asPath !== "/login" && !isNavigating) {
      logRouterAction("DISCONNECT_REDIRECT", { from: router.asPath, to: "/login" });
      safePush("/login", "disconnect");
    }
  };

  const getLayout = Component.getLayout || ((page: React.ReactNode) => page);

  useEffect(() => {
    const shouldShowStatus = (window.location.pathname == "/login" && role.length == 0) || window.location.pathname == "/";

    logRouterAction("STATUS_UPDATE", {
      pathname: window.location.pathname,
      roleCount: role.length,
      shouldShowStatus,
      currentStatus: status,
    });

    setStatus(shouldShowStatus);
  }, [status, role]);

  useEffect(() => {
    setMounted(true);

    let ethObject: ethers.Eip1193Provider = window.ethereum;
    provider = new ethers.BrowserProvider(ethObject);

    logRouterAction("APP_INITIALIZATION", {
      hasEthereum: !!window.ethereum,
      userAgent: navigator.userAgent,
      url: window.location.href,
      reactVersion: React.version,
      isStrictMode: process.env.NODE_ENV === "development", // Likely indicator
    });

    // Add a small delay to ensure all initial state is set
    const timer = setTimeout(() => {
      logRouterAction("APP_READY", { initialRoute: router.asPath });
    }, 100);

    return () => clearTimeout(timer);
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
