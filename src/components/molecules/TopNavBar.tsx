import React, { useContext } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Layout } from "antd/es";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";

import logoDark from "@/assets/nomyx_logo_dark.png";
import logoLight from "@/assets/nomyx_logo_light.png";
import ThemeToggle from "@/components/atoms/ThemeToggle";

import { UserContext } from "../../context/UserContext";
import { WalletPreference } from "../../utils/constants";

// import { UserContext } from "@/pages/_app";

const { Header } = Layout;

interface TopNavBarProps {
  onDisconnect: () => void;
  onLogout: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onDisconnect, onLogout }) => {
  const { walletPreference } = useContext(UserContext);
  const { disconnect } = useDisconnect();

  // Handle logout based on wallet preference
  const handleLogout = () => {
    if (walletPreference === WalletPreference.MANAGED) {
      // Logout for wallet-based login
      onLogout();
    }
  };

  useAccount({
    onDisconnect: function () {
      disconnect();
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
        {walletPreference === WalletPreference.PRIVATE && <ConnectButton />}
        {walletPreference === WalletPreference.MANAGED && (
          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-md h-9 text-sm leading-normal dark:bg-white dark:text-black"
          >
            Logout
          </button>
        )}
        <ThemeToggle />
      </div>
    </Header>
  );
};

export default TopNavBar;
