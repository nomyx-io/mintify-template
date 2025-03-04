import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

// Mock data for TradeFi pools
const mockPools = [
  {
    id: "pool1",
    attributes: {
      title: "Pool 1",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis. Maecenas ornare massa et pharetra suscipit. Sed ultrices, lacus...",
      logo: {
        _url: "https://via.placeholder.com/150/6c5ce7/FFFFFF?text=P1",
      },
      coverImage: {
        _url: "https://via.placeholder.com/800x400/6c5ce7/FFFFFF?text=Pool+1",
      },
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 477000,
      totalInvoiceAmount: 477000,
      totalInvoices: 4,
      usdcRemaining: 0,
      maturityDate: "2025-12-25T00:00:00.000Z",
    },
  },
  {
    id: "pool2",
    attributes: {
      title: "Pool 2",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis. Maecenas ornare massa et pharetra suscipit. Sed ultrices, lacus...",
      logo: {
        _url: "https://via.placeholder.com/150/8e44ad/FFFFFF?text=P2",
      },
      coverImage: {
        _url: "https://via.placeholder.com/800x400/8e44ad/FFFFFF?text=Pool+2",
      },
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 22000,
      totalInvoiceAmount: 18000,
      totalInvoices: 4,
      usdcRemaining: 4000,
      maturityDate: "2025-11-15T00:00:00.000Z",
    },
  },
  {
    id: "pool3",
    attributes: {
      title: "Pool 3",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis. Maecenas ornare massa et pharetra suscipit. Sed ultrices, lacus...",
      logo: {
        _url: "https://via.placeholder.com/150/3498db/FFFFFF?text=P3",
      },
      coverImage: {
        _url: "https://via.placeholder.com/800x400/3498db/FFFFFF?text=Pool+3",
      },
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 22000,
      totalInvoiceAmount: 16000,
      totalInvoices: 4,
      usdcRemaining: 6000,
      maturityDate: "2025-10-10T00:00:00.000Z",
    },
  },
];

export const TradeFinanceService = () => {
  const blockchainService = BlockchainService.getInstance();
  ParseClient.initialize();

  // Mock implementation that returns the mock data
  const getTradeFiPools = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockPools];
  };

  const getTradeFiPoolDetails = async (id: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const pool = mockPools.find((pool) => pool.id === id);
    return pool ? JSON.parse(JSON.stringify(pool)) : null;
  };

  const createTradeFiPool = async (poolData: {
    title: string;
    description: string;
    logo: string;
    coverImage: string;
    creditType: string;
    maturityDate: Date;
  }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a new mock pool with the provided data
    const newPool = {
      id: `pool${mockPools.length + 1}`,
      attributes: {
        title: poolData.title,
        description: poolData.description,
        logo: {
          _url: poolData.logo || "https://via.placeholder.com/150/2ecc71/FFFFFF?text=New",
        },
        coverImage: {
          _url: poolData.coverImage || "https://via.placeholder.com/800x400/2ecc71/FFFFFF?text=New+Pool",
        },
        creditType: poolData.creditType,
        totalUsdcDeposited: 0,
        totalInvoiceAmount: 0,
        totalInvoices: 0,
        usdcRemaining: 0,
        maturityDate: poolData.maturityDate.toISOString(),
      },
    };

    // In a real implementation, we would save this to the backend
    // For now, we'll just return the mock data
    return newPool;
  };

  return {
    getTradeFiPools,
    getTradeFiPoolDetails,
    createTradeFiPool,
  };
};
