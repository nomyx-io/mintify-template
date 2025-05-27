"use client";

import { useState } from "react";

import { Layout, Card, Form, Input, Button } from "antd";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Parse from "parse";
import { toast } from "react-toastify";

import logoDark from "../../assets/nomyx_logo_dark.png";
import logoLight from "../../assets/nomyx_logo_light.png";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await Parse.Cloud.run("requestPasswordReset", {
        email: values.email,
      });

      if (response.success) {
        toast.success(`We have sent an email to ${values.email} with a reset password link.`);
        router.push("/login");
      } else {
        toast.error("Failed to send password reset email!");
      }
    } catch (error) {
      toast.error(error?.toString());
      console.error("Error in onSubmit:", error);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Fogot Password - Nomyx Mintify</title>
      </Head>
      <div
        className="relative w-full min-h-screen overflow-hidden flex flex-col"
        style={{
          backgroundImage: "url('/images/nomyx_banner.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Left Side */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 md:px-6 my-10">
            <div className="w-full max-w-2xl">
              <Image src={logoDark} alt="Logo" width={630} height={240} priority className="" />
            </div>
          </div>

          <div className="max-[550px]:hidden w-1/2 flex flex-col justify-center items-center p-2">
            {/* The heading at the top */}
            {/* The container that will hold the button in the middle */}

            <div className="flex-grow flex items-center justify-center w-full">
              <div className="bg-nomyxDark1 bg-opacity-90 text-nomyxWhite shadow-lg rounded-lg p-4 max-w-2xl w-full">
                <div className="w-full flex flex-col justify-center items-center">
                  <Card
                    title={<span className="text-white">Forgot Password</span>}
                    style={{
                      width: "100%",
                      maxWidth: "550px",
                      border: "none",
                    }}
                    className="signup-card bg-transparent shadow-lg rounded-lg wallet-setup-radio-group"
                  >
                    <p className="mb-6 text-left !text-white font-normal text-sm">Enter your email, and we will send you a password reset link.</p>
                    <Form layout="vertical" onFinish={onSubmit} className="w-full">
                      <Form.Item<string>
                        name="email"
                        label={<span className="text-nomyxGray1">Email</span>}
                        rules={[
                          {
                            required: true,
                            message: "Please input your email!",
                          },
                          {
                            type: "email",
                            message: "Please enter a valid email address!",
                          },
                        ]}
                      >
                        <Input name="email" type="email" placeholder="Please enter your email" className="input-field" />
                      </Form.Item>

                      <Form.Item>
                        <div className="flex justify-between items-center">
                          <Link href="/login" className="font-semibold text-blue-600">
                            Back to Login
                          </Link>
                          <Button
                            type="primary"
                            htmlType="submit"
                            className="signup-button bg-blue-600 hover:bg-blue-700 text-nomyxWhite"
                            loading={loading}
                          >
                            Submit
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
