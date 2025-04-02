"use client";

import { useState } from "react";

import { Layout, Card, Form, Input, Button } from "antd";
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
    <div
      className="relative w-full min-h-screen overflow-hidden flex flex-col forgot-password-div"
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
            <Image src={logoLight} alt="Logo" width={630} height={240} priority className="block dark:hidden" />
            <Image src={logoDark} alt="Logo" width={630} height={240} priority className="hidden dark:block" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-2">
          <div className="p-10 max-w-2xl w-full">
            <Card
              title={<span className="text-black">Forgot Password</span>}
              style={{ width: "100%", maxWidth: "550px", border: "1px solid #BBBBBB" }}
              className="signup-card bg-[#3E81C833] shadow-lg rounded-lg"
            >
              <p className="mb-6 text-left text-nomyx-dark1-dark font-normal text-sm">
                Enter your email, and we will send you a password reset link.
              </p>
              <Form layout="vertical" onFinish={onSubmit} className="w-full">
                <Form.Item<string>
                  name="email"
                  label={<span className="text-[#1F1F1F]">Email</span>}
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
                  <Input
                    name="email"
                    type="email"
                    placeholder="Please enter your email"
                    style={{
                      color: "#1F1F1F",
                      backgroundColor: "white",
                      border: "1px solid #BBBBBB",
                    }}
                    className="signup-input"
                  />
                </Form.Item>

                <Form.Item>
                  <div className="flex justify-between items-center">
                    <Link href="/login" className="font-semibold text-blue-600">
                      Back to Login
                    </Link>
                    <Button type="primary" htmlType="submit" className="signup-button" loading={loading}>
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
  );
};

export default ForgotPassword;
