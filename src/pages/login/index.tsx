import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

import logoDark from "@/assets/nomyx_logo_dark.png";
import logoLight from "@/assets/nomyx_logo_light.png";

import styles from "./login.module.scss";

export default function Login() {
  return (
    <div className="relative h-screen w-screen flex overflow-hidden p-0">
      <div className="bg-gradient-to-b from-[#3E81C8] to-[#3F206B] max-[550px]:hidden w-1/2 flex flex-col justify-center items-center gap-10">
        <Image src={logoLight} alt="Logo" width={630} height={240} priority className="block dark:hidden" />
        <Image src={logoDark} alt="Logo" width={630} height={240} priority className="hidden dark:block" />

        <div className="text-white text-center"></div>
      </div>
      <div className="max-[550px]:hidden w-1/2 flex flex-col justify-center items-center p-2">
        <div className="text-right font-bold text-xl w-full">CARBON CREDIT MANAGER</div>
        <div className={styles.btnContainer + " flex flex-grow justify-center items-center align-middle"}>
          <ConnectButton label="Log in with Wallet" />
        </div>
      </div>
    </div>
  );
}
