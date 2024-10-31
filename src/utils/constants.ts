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

export const NFT_RECORD_FIELD_GROUPS = [
  {
    name: 'Project Info',
    fields: [
      { name: 'projectName', label: 'Project' },
      { name: 'auditor', label: 'Auditor' },
      { name: 'projectStartDate', label: 'Start Date' },
      { name: 'mintAddress', label: 'Mint to' },
      { name: 'country', label: 'Country' },
      { name: 'state', label: 'State' },
      { name: 'registerId', label: 'Registry Id' },
      { name: 'registryURL', label: 'Registry Link' },
      { name: 'issuanceDate', label: 'Issuance Date' },
      { name: 'ghgReduction', label: 'GHG Reduction' },
      { name: 'trancheCutoff', label: 'Tranche Cutoff' },
    ],
  },
  {
    name: 'Credit Info',
    fields: [
      { name: 'creditsPre2020', label: 'Pre 2020 Credits' },
      { name: 'credits2020', label: '2020 Project Credits' },
      { name: 'credits2021', label: '2021 Project Credits' },
      { name: 'credits2022', label: '2022 Project Credits' },
      { name: 'credits2023', label: '2023 Project Credits' },
      { name: 'credits2024', label: '2024 Project Credits' },
      { name: 'existingCredits', label: 'Existing Carbon Credits' },
      {
        name: 'estimatedEmissionsReduction',
        label: 'Estimated Annual Emissions Reduction',
      },
    ],
  },
  {
    name: 'Pricing Information',
    fields: [
      { name: 'price', label: 'Price per Credit' },
      { name: 'totalPrice', label: 'Total Price' },
    ],
  },
];

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

export const BASE_CHAIN: Chain = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'bETH',
  },
  rpcUrls: {
    default: {
      http: ['https://base-mainnet.g.alchemy.com/v2/wKeI-DxtBRopKqsk_pICPIgQH9qGFcBP']
    },
    public: {
      http: ['https://base-mainnet.g.alchemy.com/v2/wKeI-DxtBRopKqsk_pICPIgQH9qGFcBP']
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