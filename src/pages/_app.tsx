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
import { SessionProvider } from "next-auth/react";
import { signIn, getCsrfToken, getSession, signOut, useSession } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { toast, ToastContainer } from "react-toastify";

import PrivateRoute from "@/components/atoms/PrivateRoute";
import TopNavBar from "@/components/molecules/TopNavBar";
import NomyxAppContext from "@/context/NomyxAppContext";
import Web3Providers from "@/context/Web3Providers";
import BlockchainService from "@/services/BlockchainService";
import ParseClient from "@/services/ParseClient";
import { generateRandomString } from "@/utils/regex";

// import { UserContext } from "../context/UserContext";
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

// Global state to prevent multiple simultaneous operations
const globalState = {
  isInitializingBlockchain: false,
  isNavigating: false,
  isConnecting: false,
  isLoggingIn: false,
  lastNavigationAttempt: 0,
  pendingNavigation: null as string | null,
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

// Enhanced blockchain service initialization with singleton protection
const initializeBlockchainService = async () => {
  if (globalState.isInitializingBlockchain) {
    console.log("Blockchain service initialization already in progress, waiting...");
    // Wait for existing initialization
    let attempts = 0;
    while (globalState.isInitializingBlockchain && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    return BlockchainService.getInstance();
  }

  globalState.isInitializingBlockchain = true;

  try {
    const service = BlockchainService.getInstance();
    if (!service) {
      globalState.isInitializingBlockchain = false;
      return null;
    }

    // Wait for service to complete internal initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return service;
  } catch (error) {
    console.warn("BlockchainService initialization failed:", error);
    return null;
  } finally {
    globalState.isInitializingBlockchain = false;
  }
};

// Debounced navigation function to prevent rapid successive navigations
const debouncedNavigation = (router: any, url: string, delay: number = 500) => {
  const now = Date.now();

  // If same URL is being navigated to within delay period, ignore
  if (globalState.pendingNavigation === url && now - globalState.lastNavigationAttempt < delay) {
    console.log(`Navigation to ${url} debounced`);
    return;
  }

  globalState.lastNavigationAttempt = now;
  globalState.pendingNavigation = url;
  globalState.isNavigating = true;

  // Clear pending navigation after delay
  setTimeout(() => {
    if (globalState.pendingNavigation === url) {
      globalState.pendingNavigation = null;
    }
  }, delay);

  return router.push(url);
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  const [mounted, setMounted] = useState(false);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [role, setRole] = useState<string[]>([]);
  const [forceLogout, setForceLogout] = useState(false);
  const [status, setStatus] = useState(true);
  const [user, setUser] = useState({}); // State to hold user
  const [walletPreference, setWalletPreference] = useState<WalletPreference | null>(null);
  const [dfnsToken, setDfnsToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  // Navigation timeout state
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Add refs to track navigation state and prevent race conditions
  const isNavigatingRef = useRef(false);
  const currentRouteRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // Navigation timeout configuration
  const NAV_TIMEOUT_MS = 2000; // Adjust this value to simulate different network conditions
  const ENABLE_NAV_TIMEOUT = process.env.NODE_ENV === "development"; // Only enable in development

  //parseInitialize();

  // Enhanced navigation timeout effect with aggressive error handling
  useEffect(() => {
    if (!ENABLE_NAV_TIMEOUT) return;

    const handleRouteChangeStart = (url: string) => {
      console.log(`[Nav Timeout] Starting navigation to: ${url}`);

      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Cancel any existing navigation
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        console.log(`[Nav Timeout] Aborting previous navigation`);
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this navigation
      abortControllerRef.current = new AbortController();

      isNavigatingRef.current = true;
      globalState.isNavigating = true;
      setNavigationLoading(true);
      currentRouteRef.current = url;

      // Set a maximum navigation timeout (safety net)
      navigationTimeoutRef.current = setTimeout(() => {
        console.log(`[Nav Timeout] Navigation timeout exceeded for: ${url}`);
        setNavigationLoading(false);
        isNavigatingRef.current = false;
        globalState.isNavigating = false;
      }, 10000); // 10 second safety timeout
    };

    const handleRouteChangeComplete = (url: string) => {
      console.log(`[Nav Timeout] Navigation complete to: ${url}`);

      // Clear timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Only process if this is the current navigation
      if (currentRouteRef.current === url && isNavigatingRef.current) {
        // Add artificial delay to simulate production conditions
        setTimeout(() => {
          if (currentRouteRef.current === url) {
            // Double-check we're still on the same route
            console.log(`[Nav Timeout] Navigation timeout complete for: ${url}`);
            setNavigationLoading(false);
            isNavigatingRef.current = false;
            globalState.isNavigating = false;
          }
        }, NAV_TIMEOUT_MS);
      }
    };

    const handleRouteChangeError = (err: any, url: string) => {
      console.log(`[Nav Timeout] Navigation error to: ${url}`, err);

      // Clear timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Handle specific error types
      if (
        err.message?.includes("Cancel rendering route") ||
        err.message?.includes("Route Cancelled") ||
        err.message?.includes("Abort fetching component")
      ) {
        console.log(`[Nav Timeout] Route rendering was cancelled/aborted for: ${url}`);

        // For cancelled routes, try a delayed retry if it's the same route we're trying to reach
        if (globalState.pendingNavigation === url) {
          console.log(`[Nav Timeout] Scheduling retry for cancelled route: ${url}`);
          setTimeout(() => {
            if (globalState.pendingNavigation === url && !globalState.isNavigating) {
              console.log(`[Nav Timeout] Retrying navigation to: ${url}`);
              router.push(url).catch((retryErr) => {
                console.log(`[Nav Timeout] Retry failed for: ${url}`, retryErr);
              });
            }
          }, 1000);
        }
      }

      // Clean up navigation state
      setTimeout(() => {
        setNavigationLoading(false);
        isNavigatingRef.current = false;
        globalState.isNavigating = false;
      }, 500);
    };

    // Add beforeunload handler to clean up navigation state
    const handleBeforeUnload = () => {
      isNavigatingRef.current = false;
      globalState.isNavigating = false;
      setNavigationLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Clean up abort controller and timeout
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [router, NAV_TIMEOUT_MS, ENABLE_NAV_TIMEOUT]);

  // Add effect to handle router ready state
  useEffect(() => {
    if (router.isReady) {
      currentRouteRef.current = router.asPath;
      globalState.isNavigating = false;
    }
  }, [router.isReady, router.asPath]);

  const getToken = async (request: any) => {
    try {
      // Add abort signal to prevent race conditions
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await axios.post(`${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/auth/login`, request, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = response.data;
      return {
        walletPreference: data?.user?.walletPreference,
        token: data?.access_token || "",
        roles: data?.user?.roles || [],
        user: data?.user,
        dfnsToken: data?.dfns_token,
      };
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.log("Authentication request was aborted");
      } else {
        console.log("Error during authentication:", error);
      }
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
    if (isConnected || globalState.isConnecting) {
      console.log("Connection already in progress or established");
      return;
    }

    // Prevent multiple simultaneous connections
    if (globalState.isNavigating || globalState.isLoggingIn) {
      console.log("Navigation or login in progress, deferring connection");
      return;
    }

    globalState.isConnecting = true;

    try {
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
          // Add timeout protection for MetaMask requests
          const signerPromise = provider.getSigner();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Signer request timeout")), 15000));

          const signer: any = await Promise.race([signerPromise, timeoutPromise]);
          signature = await signer.signMessage(message);
        } catch (error: any) {
          const message = error.reason ? error.reason : error.message;
          console.error("Error getting signer:", error);
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
        return;
      }

      // Initialize blockchain service with protection
      const _blockchainService = await initializeBlockchainService();
      if (_blockchainService) {
        setBlockchainService(_blockchainService);
      }

      try {
        const network = await provider.getNetwork();
        const chainId: string = `${network.chainId}`;
        const config = process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID;

        if (!config || config !== chainId) {
          setIsConnected(false);
          return;
        }
        setIsConnected(true);
        parseInitialize();
      } catch (error) {
        console.error("Error getting network:", error);
        setIsConnected(false);
      }
    } finally {
      globalState.isConnecting = false;
    }
  }, [isConnected]);

  const onLogoutEmailPassword = async () => {
    // Prevent logout during navigation
    if (globalState.isNavigating || globalState.isLoggingIn) {
      console.log("Navigation or login in progress, deferring logout");
      return;
    }

    try {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        // Add timeout to logout request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Invalidate the session token on the server
        await axios.post(
          `${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/auth/logout`,
          {},
          {
            headers: {
              "x-parse-session-token": token,
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        await signOut({ callbackUrl: "/login" });
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.log("Logout request was aborted");
      } else {
        console.error("Error during logout:", error);
      }
      toast.error("Error during logout. Please try again.");
      return;
    }

    // Reset client-side state
    setRole([]);
    setWalletPreference(null);
    setDfnsToken(null);
    setUser({});
    setForceLogout(false);
    setIsConnected(false);
    localStorage.removeItem("sessionToken");

    toast.success("Logged out successfully.");
  };

  // Enhanced onLogin function with better error handling and collision prevention
  const onLogin = async (email: string, password: string) => {
    // Prevent multiple simultaneous logins
    if (globalState.isLoggingIn) {
      console.log("Login already in progress");
      return;
    }

    if (globalState.isNavigating || globalState.isConnecting) {
      console.log("Navigation or connection in progress, deferring login");
      return;
    }

    globalState.isLoggingIn = true;

    try {
      const result = await signIn("standard", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (!result?.ok) {
        toast.dismiss("login");
        toast.error(result?.status === 401 ? "Incorrect username / password" : "An error occurred.");
        return;
      }

      // Check session with retries and abort controller
      const maxRetries = 5;
      let session = null;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second total timeout

      try {
        for (let i = 0; i < maxRetries; i++) {
          if (controller.signal.aborted) break;

          session = await getSession();
          if (session?.user?.accessToken) {
            if (session?.user?.roles.length > 0) {
              setRole([...session.user.roles]);
              setUser(session?.user);
              setDfnsToken(session?.user.dfns_token);
              setWalletPreference(walletPreference);
              localStorage.setItem("sessionToken", session.user.accessToken);
              setIsConnected(true);

              // Always initialize blockchainService for email login
              const service = await initializeBlockchainService();
              if (service) {
                setBlockchainService(service);
              }

              ParseClient.initialize(session.user.accessToken);
            } else {
              toast.error("We couldn't verify your login details. Please check your username and password.");
              setForceLogout(true);
            }
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        clearTimeout(timeoutId);
      }

      if (!session?.user?.accessToken) {
        toast.dismiss("login");
        toast.error("Session initialization failed");

        // Use debounced navigation to prevent conflicts
        setTimeout(() => {
          if (!globalState.isNavigating) {
            debouncedNavigation(router, "/login");
          }
        }, 1000);
        return;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      globalState.isLoggingIn = false;
    }
  };

  const restoreSession = async () => {
    try {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        const { valid, roles, walletPreference, user, dfnsToken } = await validateToken(token);
        if (valid && roles.length > 0) {
          setRole(roles);
          setUser(user);
          setDfnsToken(dfnsToken);
          setWalletPreference(walletPreference);
          setIsConnected(true);

          // Initialize blockchain service for restored sessions
          const service = await initializeBlockchainService();
          if (service) {
            setBlockchainService(service);
          }

          let session = await getSession();
          user.dfns_Token = dfnsToken;
          user.roles = roles;
          user.walletPreference = walletPreference;
          if (session) {
            session.user = user;
            session.expires = new Date(user.exp * 1000).toISOString();
          }
        } else {
          // Token is invalid or roles are empty
          localStorage.removeItem("sessionToken");
          setForceLogout(true);
          setRole([]);
          setWalletPreference(null);
          setDfnsToken(null);
          setUser({});
          setIsConnected(false);

          // Use debounced navigation
          setTimeout(() => {
            if (!globalState.isNavigating) {
              debouncedNavigation(router, "/login");
            }
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Error restoring session:", error);
      localStorage.removeItem("sessionToken");
      setForceLogout(true);
    } finally {
      setInitializing(false);
    }
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
    // Prevent disconnect during navigation
    if (globalState.isNavigating || globalState.isLoggingIn) {
      console.log("Navigation or login in progress, deferring disconnect");
      return;
    }

    setRole([]);
    setForceLogout(true);
    setDfnsToken(null);
    setUser({});
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

    if (typeof window !== "undefined" && window.ethereum) {
      let ethObject: ethers.Eip1193Provider = window.ethereum;
      provider = new ethers.BrowserProvider(ethObject);
    }
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
    <SessionProvider refetchInterval={0}>
      <NomyxAppContext.Provider value={{ blockchainService, setBlockchainService }}>
        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]">
            <Spin />
          </div>
        )}
        {/* Enhanced Navigation Loading Overlay */}
        {navigationLoading && ENABLE_NAV_TIMEOUT && (
          <div className="z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000080]">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-white">Simulating production navigation delay...</div>
              <div className="mt-2 text-sm text-gray-300">Current route: {currentRouteRef.current}</div>
              <div className="mt-1 text-xs text-gray-400">
                Global state: Nav:{globalState.isNavigating ? "Y" : "N"} | Connect:{globalState.isConnecting ? "Y" : "N"} | Login:
                {globalState.isLoggingIn ? "Y" : "N"}
              </div>
            </div>
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
      </NomyxAppContext.Provider>
    </SessionProvider>
  );
}
