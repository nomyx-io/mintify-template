import React, { useContext } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Layout } from "antd/es";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";

import logoDark from "@/assets/nomyx_logo_dark.png";
import logoLight from "@/assets/nomyx_logo_light.png";
import ThemeToggle from "@/components/atoms/ThemeToggle";
import { UserContext } from "@/pages/_app";

const { Header } = Layout;

const TopNavBar = () => {
  const onDisconnect = useContext(UserContext);

  useAccount({
    onDisconnect: function () {
      onDisconnect();
    },
  });

  return (
    <Header className="w-full p-5 flex items-center justify-between bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark">
      <div>
        <Link href={"/home"}>
          <Image src={logoLight} alt="Logo" width={150} height={40} priority className="block dark:hidden" />
          <Image src={logoDark} alt="Logo" width={150} height={40} priority className="hidden dark:block" />
        </Link>
      </div>
      <div className="hidden sm:flex items-center justify-end gap-5">
        <ConnectButton />
        <ThemeToggle />
      </div>
    </Header>
  );
};

export default TopNavBar;
