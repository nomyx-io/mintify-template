import { useContext, useEffect, useState, useRef } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Spin, Layout, Card, Radio, Form, Input, Button } from "antd";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";

import logoDark from "../../assets/nomyx_logo_dark.png";
import logoLight from "../../assets/nomyx_logo_light.png";
import { UserContext } from "../../context/UserContext";
import { LoginPreference } from "../../utils/constants";

export default function Login({ forceLogout, onConnect, onDisconnect, onLogin }) {
  const [loginPreference, setLoginPreference] = useState(LoginPreference.USERNAME_PASSWORD);
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const [isConnectTriggered, setIsConnectTriggered] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  useEffect(() => {
    if (forceLogout) {
      disconnect();
    }
  }, [forceLogout, disconnect]);

  // Handle standard login form submission
  const handleStandardLogin = async (values) => {
    const { email, password } = values;
    await onLogin(email, password); // Invoke the onLogin function passed from App
    router.replace("/home"); // Redirect after successful login
  };

  const handleConnect = async ({ address, connector, isReconnected }) => {
    console.log("Connected with address: ", address);
    if (!isConnectTriggered) {
      console.log("Connect Triggered");
      setIsConnectTriggered(true);
      await onConnect(address, connector);
    }
  };

  const handleDisconnect = () => {
    setIsConnectTriggered(false);
    onDisconnect();
    router.replace("/"); // Redirect to root path upon disconnect
  };

  useAccount({
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
  });

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
        {isConnected ? (
          <div className="flex flex-1 flex-col lg:flex-row items-center justify-center">
            <Spin />
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
              {/* The heading at the top */}
              {/* <h1 className="text-right font-bold text-xl mb-4 w-full mt-8 mr-4">CARBON CREDIT MANAGER</h1> */}
              {/* The container that will hold the button in the middle */}

              <div className="flex-grow flex items-center justify-center w-full">
                <div className="bg-nomyxDark1 bg-opacity-90 text-nomyxWhite shadow-lg rounded-lg p-4 max-w-2xl w-full">
                  <div className="w-full flex flex-col justify-center items-center">
                    <Card
                      title={<span className="text-white">Sign In</span>} // Set title color to black
                      style={{
                        width: "100%",
                        maxWidth: "550px",
                        border: "none",
                      }}
                      className="signup-card bg-transparent shadow-lg rounded-lg wallet-setup-radio-group"
                      extra={
                        <Radio.Group value={loginPreference} onChange={(e) => setLoginPreference(e.target.value)} buttonStyle="solid">
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
                        <Form layout="vertical" onFinish={handleStandardLogin} className="w-full" initialValues={{ email: "", password: "" }}>
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
                            <Input type="email" placeholder="Enter your email" className="input-field" />
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
                            <Input.Password placeholder="Enter your password" className="input-field" />
                          </Form.Item>
                          <div className="flex justify-between items-center">
                            <div className="flex justify-between">
                              <Link href="/forgot-password" className="font-semibold text-blue-600">
                                Forgot Password?
                              </Link>
                            </div>
                            <Form.Item>
                              <div className="flex justify-end">
                                <Button type="primary" htmlType="submit" className="signup-button bg-blue-600 hover:bg-blue-700 text-nomyxWhite">
                                  Log in
                                </Button>
                              </div>
                            </Form.Item>
                          </div>
                        </Form>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ConnectButton label="Log in with Wallet" showBalance={false} onConnect={handleConnect} onDisconnect={handleDisconnect} />
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
