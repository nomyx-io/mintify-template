import { createContext, ReactNode } from "react";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { WalletAddressProvider } from "@/context/WalletAddressContext";
import { BASESEP_CHAIN, LOCALHOST_CHAIN, BASE_CHAIN, OPTSEP_CHAIN } from "@/utils/chains";

const localhost = LOCALHOST_CHAIN;
const baseSep = BASESEP_CHAIN;
const base = BASE_CHAIN;
const optSep = OPTSEP_CHAIN;

const { chains, publicClient } = configureChains(
  [baseSep, base, optSep],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "" }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "LL Mintify", // need to change for Kronos
  projectId: "ae575761a72370ab88834655acbba677",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

export const ProviderContext = createContext({});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} coolMode>
        <WalletAddressProvider>{children}</WalletAddressProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
