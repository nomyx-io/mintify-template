// ResetPassword.tsx
"use client";

import React, { useState } from "react";

import { CheckOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { Form, Input, Card, Button } from "antd";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Parse from "parse";
import { toast } from "react-toastify";

import logoDark from "../../assets/nomyx_logo_dark.png";
import logoLight from "../../assets/nomyx_logo_light.png";

// Define the form inputs type
type ResetPasswordFormInputs = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = ({ token }: { token: string }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  // Define password criteria
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Function to render icons based on criteria
  const renderIcon = (condition: boolean) => {
    return condition ? <CheckOutlined className="!text-green-700" /> : <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />;
  };

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      if (data.password !== data.confirmPassword) {
        form.setFields([
          {
            name: "confirmPassword",
            errors: ["Passwords do not match!"],
          },
        ]);
        return;
      }

      // Validate password criteria before submission
      const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
      if (!isPasswordValid) {
        toast.error("Please meet all password requirements.");
        return;
      }

      // Call the Parse Cloud function to reset the password
      const response = await Parse.Cloud.run("resetPassword", {
        newPassword: data.password,
        token: token,
      });

      if (response.success) {
        toast.success(response.message || "Password has been reset successfully!");
        router.push("/login"); // Redirect to login page after successful reset
      } else {
        toast.error(response.message || "Failed to reset password.");
      }
    } catch (error: any) {
      toast.error(error?.toString());
      console.error("Error in onSubmit:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - Nomyx Mintify</title>
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
          {/* Right Section - Reset Password Form */}
          <div className="max-[550px]:hidden w-1/2 flex flex-col justify-center items-center p-2">
            {/* The heading at the top */}
            {/* The container that will hold the button in the middle */}
            <div className="flex-grow flex items-center justify-center w-full">
              <div className="bg-nomyxDark1 bg-opacity-90 text-nomyxWhite shadow-lg rounded-lg p-4 max-w-2xl w-full">
                <div className="w-full flex flex-col justify-center items-center">
                  <Card
                    title={<span className="text-white">Reset Password</span>}
                    style={{
                      width: "100%",
                      maxWidth: "550px",
                      border: "none",
                    }}
                    className="signup-card bg-transparent shadow-lg rounded-lg wallet-setup-radio-group"
                  >
                    <Form layout="vertical" form={form} onFinish={onSubmit}>
                      {/* Password */}
                      <Form.Item
                        name="password"
                        label={<span className="text-nomyxGray1">Password</span>}
                        rules={[
                          {
                            required: true,
                            message: "Please enter your password!",
                          },
                          {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                            message: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-input"
                        />
                      </Form.Item>

                      {/* Confirm Password */}
                      <Form.Item
                        name="confirmPassword"
                        label={<span className="text-nomyxGray1">Confirm Password</span>}
                        dependencies={["password"]}
                        rules={[
                          {
                            required: true,
                            message: "Please confirm your password!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("Passwords do not match!"));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-input"
                        />
                      </Form.Item>

                      {/* Password Requirements */}
                      <div className="text-sm mb-4">
                        <p className="flex items-center">
                          {renderIcon(passwordCriteria.minLength)}
                          <span className={`ml-2 ${passwordCriteria.minLength ? "text-green-700" : "text-gray-500"}`}>At least 8 characters</span>
                        </p>
                        <p className="flex items-center">
                          {renderIcon(passwordCriteria.hasUppercase)}
                          <span className={`ml-2 ${passwordCriteria.hasUppercase ? "text-green-700" : "text-gray-500"}`}>
                            At least 1 uppercase letter
                          </span>
                        </p>
                        <p className="flex items-center">
                          {renderIcon(passwordCriteria.hasLowercase)}
                          <span className={`ml-2 ${passwordCriteria.hasLowercase ? "text-green-700" : "text-gray-500"}`}>
                            At least 1 lowercase letter
                          </span>
                        </p>
                        <p className="flex items-center">
                          {renderIcon(passwordCriteria.hasNumber)}
                          <span className={`ml-2 ${passwordCriteria.hasNumber ? "text-green-700" : "text-gray-500"}`}>At least 1 number</span>
                        </p>
                        <p className="flex items-center">
                          {renderIcon(passwordCriteria.hasSpecialChar)}
                          <span className={`ml-2 ${passwordCriteria.hasSpecialChar ? "text-green-700" : "text-gray-500"}`}>
                            At least 1 special character
                          </span>
                        </p>
                      </div>
                      <Form.Item className="actions">
                        <Button type="primary" htmlType="submit" className="signup-button bg-blue-600 hover:bg-blue-700 text-nomyxWhite">
                          Reset Password
                        </Button>
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

export default ResetPassword;

// Define getServerSideProps
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;

  // Check if params exists and has the token property
  if (params && typeof params.token === "string") {
    return {
      props: { token: params.token }, // Pass it as props to the page
    };
  }

  // Handle the case where token is not available
  return {
    notFound: true, // This will trigger a 404 page
  };
};
