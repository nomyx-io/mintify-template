import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

import logoDark from "@/assets/nomyx_logo_dark.png";
import logoLight from "@/assets/nomyx_logo_light.png";

import styles from "./login.module.scss";

export default function Login() {
  return (
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
            <Image src={logoLight} alt="Logo" width={630} height={240} priority className="block dark:hidden" />
            <Image src={logoDark} alt="Logo" width={630} height={240} priority className="hidden dark:block" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col px-4 md:px-6 my-10">
          {/* The heading at the top */}
          <h1 className="text-right font-bold text-xl mb-4">CARBON CREDIT MANAGER</h1>

          {/* The container that will hold the button in the middle */}
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-[#3E81C833] shadow-lg rounded-lg p-10 max-w-2xl items-center justify-center login-div">
              <ConnectButton label="Log in with Wallet" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
