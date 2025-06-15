import { useContext, useEffect, useState, useRef, useCallback } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Spin, Layout, Card, Radio, Form, Input, Button } from "antd";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount, useDisconnect } from "wagmi";

import logoDark from "../../assets/nomyx_logo_dark.png";
import logoLight from "../../assets/nomyx_logo_light.png";
import { UserContext } from "../../context/UserContext";
import { LoginPreference } from "../../utils/constants";

export default function Login({ forceLogout, onConnect, onDisconnect, onLogin }) {
  const [loginPreference, setLoginPreference] = useState(LoginPreference.USERNAME_PASSWORD);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const hasRedirectedRef = useRef(false);

  // Handle user authentication and redirect
  useEffect(() => {
    if (user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/home");
    }
  }, [user, router]);

  // Handle force logout
  useEffect(() => {
    if (forceLogout) {
      hasRedirectedRef.current = false;
      setIsLoggingIn(false);
      disconnect();
    }
  }, [forceLogout, disconnect]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      hasRedirectedRef.current = false;
    };
  }, []);

  const handleStandardLogin = async (values) => {
    if (isLoggingIn) return;

    try {
      setIsLoggingIn(true);
      const { email, password } = values;
      await onLogin(email, password);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggingIn(false);
    }
  };

  const handleConnect = useCallback(
    async ({ address, connector }) => {
      if (isLoggingIn || hasRedirectedRef.current) return;

      try {
        setIsLoggingIn(true);
        await onConnect(address, connector);
      } catch (error) {
        console.error("Connection error:", error);
        setIsLoggingIn(false);
      }
    },
    [isLoggingIn, onConnect]
  );

  const handleDisconnect = useCallback(() => {
    hasRedirectedRef.current = false;
    setIsLoggingIn(false);
    onDisconnect();
    router.replace("/");
  }, [onDisconnect, router]);

  useAccount({
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  });

  const showLoadingState = isConnected || isLoggingIn || (user && !hasRedirectedRef.current);

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
              <div className="mt-4 text-lg">{isLoggingIn ? "Signing in..." : "Redirecting..."}</div>
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
                          disabled={isLoggingIn}
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
                          disabled={isLoggingIn}
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
                            <Input type="email" placeholder="Enter your email" className="input-field" disabled={isLoggingIn} />
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
                            <Input.Password placeholder="Enter your password" className="input-field" disabled={isLoggingIn} />
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
                                  loading={isLoggingIn}
                                  disabled={isLoggingIn}
                                >
                                  {isLoggingIn ? "Signing in..." : "Log in"}
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
