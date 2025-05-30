import { useContext, useEffect, useState, useRef } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Spin, Layout, Card, Radio, Form, Input, Button } from "antd";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";

import logoDark from "../../assets/nomyx_logo_dark.png";
import logoLight from "../../assets/nomyx_logo_light.png";
// import { UserContext } from "../../context/UserContext";
import { LoginPreference } from "../../utils/constants";

export default function Login({ forceLogout, onConnect, onDisconnect, onLogin }) {
  const [loginPreference, setLoginPreference] = useState(LoginPreference.USERNAME_PASSWORD);
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const [isConnectTriggered, setIsConnectTriggered] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Prevent infinite redirects and double execution
  const hasRedirectedRef = useRef(false);
  const isHandlingLoginRef = useRef(false);
  const navigationTimeoutRef = useRef(null);

  // Enhanced redirect logic with navigation state coordination
  useEffect(() => {
    const checkAndRedirect = async () => {
      // Don't redirect if we've already redirected or are in the middle of login
      if (hasRedirectedRef.current || isHandlingLoginRef.current) {
        return;
      }

      try {
        const session = await getSession();

        // Only redirect if we have a valid session and haven't redirected yet
        if (session?.user?.accessToken && !hasRedirectedRef.current) {
          console.log("Login successful, redirecting to home...");
          hasRedirectedRef.current = true;

          // Clear any existing navigation timeout
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
          }

          // Add a small delay to ensure app state is fully updated
          navigationTimeoutRef.current = setTimeout(() => {
            if (!hasRedirectedRef.current) return; // Double-check we should still redirect

            router.replace("/home").catch((error) => {
              console.error("Redirect error:", error);
              // Reset redirect flag on error so user can try again
              hasRedirectedRef.current = false;
            });
          }, 100);
        }
      } catch (error) {
        console.error("Error checking session for redirect:", error);
      }
    };

    // Only run if we have a user and aren't already handling login
    if (user && !isHandlingLoginRef.current) {
      checkAndRedirect();
    }
  }, [user, router]);

  // Reset handling flag when user context changes (successful login)
  useEffect(() => {
    if (user && isHandlingLoginRef.current) {
      console.log("User context updated after login");
      // Small delay to let the user context fully propagate
      setTimeout(() => {
        isHandlingLoginRef.current = false;
        setIsLoggingIn(false);
      }, 100);
    }
  }, [user]);

  // Handle force logout
  useEffect(() => {
    if (forceLogout) {
      console.log("Force logout triggered");
      hasRedirectedRef.current = false;
      setIsConnectTriggered(false);
      setIsLoggingIn(false);
      isHandlingLoginRef.current = false;

      // Clear navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      disconnect();
    }
  }, [forceLogout, disconnect]);

  // Reset refs when component unmounts
  useEffect(() => {
    return () => {
      hasRedirectedRef.current = false;
      isHandlingLoginRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced standard login with better state management
  const handleStandardLogin = async (values) => {
    if (isHandlingLoginRef.current || hasRedirectedRef.current) {
      console.log("Login already in progress or user already redirected");
      return;
    }

    try {
      console.log("Starting standard login...");
      isHandlingLoginRef.current = true;
      setIsLoggingIn(true);

      const { email, password } = values;
      console.log("Attempting standard login...");

      await onLogin(email, password);

      console.log("Login request completed, waiting for context update...");

      // Set a timeout to reset state if login doesn't complete
      setTimeout(() => {
        if (isHandlingLoginRef.current && !user) {
          console.log("Login timeout, resetting state");
          isHandlingLoginRef.current = false;
          setIsLoggingIn(false);
        }
      }, 10000); // 10 second timeout
    } catch (error) {
      console.error("Login error:", error);
      isHandlingLoginRef.current = false;
      setIsLoggingIn(false);
      hasRedirectedRef.current = false; // Allow retry on error
    }
  };

  // Enhanced wallet connection with better state management
  const handleConnect = async ({ address, connector, isReconnected }) => {
    if (isConnectTriggered || isHandlingLoginRef.current || hasRedirectedRef.current) {
      console.log("Connection already in progress or user already redirected");
      return;
    }

    try {
      console.log("Connected with address: ", address);
      console.log("Connect Triggered");

      isHandlingLoginRef.current = true;
      setIsConnectTriggered(true);
      setIsLoggingIn(true);

      await onConnect(address, connector);

      console.log("Wallet connection completed, waiting for context update...");

      // Set a timeout to reset state if connection doesn't complete
      setTimeout(() => {
        if (isHandlingLoginRef.current && !user) {
          console.log("Connection timeout, resetting state");
          setIsConnectTriggered(false);
          setIsLoggingIn(false);
          isHandlingLoginRef.current = false;
        }
      }, 10000); // 10 second timeout
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnectTriggered(false);
      setIsLoggingIn(false);
      isHandlingLoginRef.current = false;
      hasRedirectedRef.current = false; // Allow retry on error
    }
  };

  const handleDisconnect = () => {
    console.log("Handling disconnect...");
    setIsConnectTriggered(false);
    setIsLoggingIn(false);
    hasRedirectedRef.current = false;
    isHandlingLoginRef.current = false;

    // Clear navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    onDisconnect();

    // Use replace instead of router.replace to avoid navigation conflicts
    window.location.href = "/"; // Force a full page refresh to avoid state issues
  };

  useAccount({
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  });

  // Enhanced loading state logic
  const showLoadingState = isConnected || isLoggingIn || (user && !hasRedirectedRef.current) || isHandlingLoginRef.current;

  // Debug logging
  useEffect(() => {
    console.log("Login component state:", {
      showLoadingState,
      isConnected,
      isLoggingIn,
      hasUser: !!user,
      hasRedirected: hasRedirectedRef.current,
      isHandlingLogin: isHandlingLoginRef.current,
    });
  }, [showLoadingState, isConnected, isLoggingIn, user]);

  return (
    <>
      <Head>
        <title>Login - Nomyx Mintify</title>
      </Head>
      <div
        className="relative w-full min-h-screen overflow-hidden flex flex-col"
        style={{
          backgroundImage: "url('/images/nomyx_banner.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {showLoadingState ? (
          <div className="flex flex-1 flex-col lg:flex-row items-center justify-center">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-lg text-white">{isLoggingIn ? "Signing in..." : "Redirecting..."}</div>
              <div className="mt-2 text-sm text-gray-300">
                Debug: Connected:{isConnected ? "Y" : "N"} | Logging:{isLoggingIn ? "Y" : "N"} | User:{user ? "Y" : "N"} | Redirected:
                {hasRedirectedRef.current ? "Y" : "N"}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col lg:flex-row">
            {/* Left Side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 md:px-6 my-10">
              <div className="w-full max-w-2xl">
                <Image src={logoDark} alt="Logo" width={630} height={240} priority className="" />
              </div>
            </div>

            {/* Right Side */}
            <div className="max-[550px]:hidden w-1/2 flex flex-col justify-center items-center p-2">
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="bg-nomyxDark1 bg-opacity-90 text-nomyxWhite shadow-lg rounded-lg p-4 max-w-2xl w-full">
                  <div className="w-full flex flex-col justify-center items-center">
                    <Card
                      title={<span className="text-white">Sign In</span>}
                      style={{
                        width: "100%",
                        maxWidth: "550px",
                        border: "none",
                      }}
                      className="signup-card bg-transparent shadow-lg rounded-lg wallet-setup-radio-group"
                      extra={
                        <Radio.Group
                          value={loginPreference}
                          onChange={(e) => setLoginPreference(e.target.value)}
                          buttonStyle="solid"
                          disabled={isLoggingIn || isHandlingLoginRef.current}
                        >
                          <Radio.Button value={LoginPreference.USERNAME_PASSWORD} className="login-radio-button">
                            Standard
                          </Radio.Button>
                          <Radio.Button value={LoginPreference.WALLET} className="login-radio-button">
                            Ethereum
                          </Radio.Button>
                        </Radio.Group>
                      }
                    >
                      {loginPreference === LoginPreference.USERNAME_PASSWORD ? (
                        <Form
                          layout="vertical"
                          onFinish={handleStandardLogin}
                          className="w-full"
                          initialValues={{ email: "", password: "" }}
                          disabled={isLoggingIn || isHandlingLoginRef.current}
                        >
                          <Form.Item
                            name="email"
                            label={<span className="text-sm mb-2 text-nomyxGray1">Email</span>}
                            rules={[
                              {
                                required: true,
                                message: "Please input your Email!",
                                type: "email",
                              },
                            ]}
                          >
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="input-field"
                              disabled={isLoggingIn || isHandlingLoginRef.current}
                            />
                          </Form.Item>

                          <Form.Item
                            name="password"
                            label={<span className="text-sm mb-2 text-nomyxGray1">Password</span>}
                            rules={[
                              {
                                required: true,
                                message: "Please input your Password!",
                              },
                            ]}
                          >
                            <Input.Password
                              placeholder="Enter your password"
                              className="input-field"
                              disabled={isLoggingIn || isHandlingLoginRef.current}
                            />
                          </Form.Item>

                          <div className="flex justify-between items-center">
                            <div className="flex justify-between">
                              <Link href="/forgot-password" className="font-semibold text-blue-600">
                                Forgot Password?
                              </Link>
                            </div>
                            <Form.Item>
                              <div className="flex justify-end">
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  className="signup-button bg-blue-600 hover:bg-blue-700 text-nomyxWhite"
                                  loading={isLoggingIn || isHandlingLoginRef.current}
                                  disabled={isLoggingIn || isHandlingLoginRef.current}
                                >
                                  {isLoggingIn || isHandlingLoginRef.current ? "Signing in..." : "Log in"}
                                </Button>
                              </div>
                            </Form.Item>
                          </div>
                        </Form>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ConnectButton label="Log in with Wallet" showBalance={false} />
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
