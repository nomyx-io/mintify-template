import React, { useContext } from "react";
import Image from "next/image";
import { Layout } from "antd/es";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ThemeToggle from "@/components/atoms/ThemeToggle";
import { useAccount } from "wagmi";
import { UserContext } from "@/pages/_app";
import Link from "next/link";
import logoDark from "@/assets/nomyx_logo_dark.png";
import logoLight from "@/assets/nomyx_logo_light.png";

const { Header } = Layout;

const TopNavBar = () => {
  const onDisconnect = useContext(UserContext);

  useAccount({
    onDisconnect: function() {
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
