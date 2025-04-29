import { Chain } from "@rainbow-me/rainbowkit";

export const BASESEP_CHAIN: Chain = {
  id: 84532,
  name: "Base Sepolia",
  network: "basesep",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "bETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_NETWORK_BASE_SEPOLIA || ""],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_NETWORK_BASE_SEPOLIA || ""],
    },
  },
  testnet: true,
};

export const OPTSEP_CHAIN: Chain = {
  id: 11155420,
  network: "optimism",
  name: "Optimism Sepolia",
  nativeCurrency: {
    name: "OP Sepolia",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_NETWORK_OPTIMISM_SEPOLIA || ""],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_NETWORK_OPTIMISM_SEPOLIA || ""],
    },
  },
  testnet: true,
};

export const BASE_CHAIN: Chain = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "bETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_NETWORK_BASE || ""],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_NETWORK_BASE || ""],
    },
  },
  testnet: true,
};

export const LOCALHOST_CHAIN: Chain = {
  id: 31337,
  name: "Localhost",
  network: "localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "lETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_NETWORK_LOCALHOST || ""],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_NETWORK_LOCALHOST || ""],
    },
  },
  testnet: true,
};
