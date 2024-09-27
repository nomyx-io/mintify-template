import { Chain } from "@rainbow-me/rainbowkit"

export const NFT_DETAIL_COLUMNS = {
  depositColumns: [
    { dataIndex: ['deposit', 'objectId'], title: 'Deposit', sortable: true },
    { dataIndex: 'createdAt', title: 'Created Date' },
    { dataIndex: 'amount', title: 'Amount', align: 'right', sortable: true }
  ],

  claimColumns: [
    { dataIndex: 'tokenId', title: 'Token Id', align: 'center', sortable: true },
    { dataIndex: 'claimAmount', title: 'Claim Amount', align: 'center', sortable: true },
    { dataIndex: 'createdAt', title: 'Created Date', align: 'center' },
  ],

  listingColumns: [
    { dataIndex: 'tokenId', title: 'Token Id', align: 'center', sortable: true },
    { dataIndex: 'listPrice', title: 'List Price', align: 'center', sortable: true },
    { dataIndex: 'createdAt', title: 'Created Date', align: 'center' },
    { dataIndex: 'active', title: 'Active', align: 'center', },
  ],

  tokenSaleColumns: [
    { dataIndex: 'tokenId', title: 'Token Id', align: 'center', sortable: true },
    { dataIndex: 'salePrice', title: 'Sale Price', align: 'center', sortable: true },
    { dataIndex: 'createdAt', title: 'Created Date', align: 'center' },
    { dataIndex: 'listingId', title: 'Listing ID', align: 'center' },
  ]
}

export const BASESEP_CHAIN: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'basesep',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'bETH',
  },
  rpcUrls: {
    default: {
      http: ['https://base-sepolia.g.alchemy.com/v2/hS_lVzkyS3Uio080pGgNiC0pdagf5iM1']
    },
    public: {
      http: ['https://base-sepolia.g.alchemy.com/v2/hS_lVzkyS3Uio080pGgNiC0pdagf5iM1']
    }
  },
  testnet: true,
}

export const LOCALHOST_CHAIN: Chain = {
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'lETH',
  },
  rpcUrls: {
    default: {
      http: ['http://0.0.0.0:8545/']
    },
    public: {
      http: ['http://0.0.0.0:8545/']
    }
  },
  testnet: true,
};