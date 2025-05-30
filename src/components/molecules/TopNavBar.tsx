import React, { useContext, useEffect, useMemo, useState } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Layout } from "antd/es";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";

import logoDark from "@/assets/nomyx_logo_dark.png";
import logoLight from "@/assets/nomyx_logo_light.png";
import ThemeToggle from "@/components/atoms/ThemeToggle";
import { CustomerService } from "@/services/CustomerService";
import { formatPrice } from "@/utils/currencyFormater";

// import { UserContext } from "../../context/UserContext";
import { WalletPreference } from "../../utils/constants";

// import { UserContext } from "@/pages/_app";

const { Header } = Layout;

interface TopNavBarProps {
  onDisconnect: () => void;
  onLogout: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onDisconnect, onLogout }) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const walletPreference = user?.walletPreference;
  const dfnsToken = user?.dfns_token;

  const { disconnect } = useDisconnect();

  const [usdcBalance, setUsdcBalance] = useState("0.00");
  const api = useMemo(() => CustomerService(), []);

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

  useEffect(() => {
    async function getUSDCBalance(walletId: string, dfnsToken: string) {
      const { balance, error } = await api.getUSDCBalance(walletId, dfnsToken);
      if (error) {
        console.error("Failed to get USDC balance:", error);
        return;
      }
      const usdcBalance = balance?.balance && balance?.decimals ? parseFloat(balance.balance) / 10 ** parseFloat(balance.decimals) : 0;
      setUsdcBalance(usdcBalance.toFixed(2));
    }
    if (dfnsToken && walletPreference === WalletPreference.MANAGED) {
      getUSDCBalance(user.walletId, dfnsToken);
    }
  }, [user, walletPreference]);

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
          <>
            <span className="border border-nomyx-main1-light dark:border-nomyx-main1-dark text-nomyx-text-light dark:text-nomyx-text-dark p-1 rounded-md mr-3 h-9 leading-normal">
              Wallet Balance: {formatPrice(parseFloat(usdcBalance), "USD")}
              {/* USDC Value + current value of user's share in pool */}
            </span>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-md h-9 text-sm leading-normal dark:bg-white dark:text-black"
            >
              Logout
            </button>
          </>
        )}
        <ThemeToggle />
      </div>
    </Header>
  );
};

export default TopNavBar;
