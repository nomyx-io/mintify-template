import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

// Mock data for TradeFi pools
const mockPools = [
  {
    id: "pool1",
    attributes: {
      title: "SGH Capital",
      description:
        "SGH Alpha is an early stage venture capital fund managed by SGH Capital. The fund is located in Luxembourg, Luxembourg and invests in Europe, California and India. The fund targets investments in crypto currencies, digital assets and decentralized finance sectors.yield.",
      logo: {
        _url: "/assets/sgh/sgh_logo.png",
      },
      coverImage: {
        _url: "/assets/sgh/cover.png",
      },
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 477000,
      totalInvoiceAmount: 477000,
      totalInvoices: 4,
      usdcRemaining: 0,
      maturityDate: "2025-12-25T00:00:00.000Z",
      // New fields based on the image
      developmentMethod: "52.53%",
      neweraScore: "4/5",
      fundSize: "200 M",
      generation: "Q3",
      economics: "2% - 20%",
      targetReturn: "3-4x gross",
      category: "Venture",
      stage: "Early/Venture",
      phase: "Closing soon",
    },
  },
  {
    id: "pool2",
    attributes: {
      title: "Pool 2",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis. Maecenas ornare massa et pharetra suscipit. Sed ultrices, lacus...",
      logo: {
        _url: "",
      },
      coverImage: {
        _url: "",
      },
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 22000,
      totalInvoiceAmount: 18000,
      totalInvoices: 4,
      usdcRemaining: 4000,
      maturityDate: "2025-11-15T00:00:00.000Z",
      // New fields with different values
      developmentMethod: "48.75%",
      neweraScore: "3/5",
      fundSize: "150 M",
      generation: "Q2",
      economics: "3% - 15%",
      targetReturn: "2-3x gross",
      category: "Growth",
      stage: "Mid/Growth",
      phase: "Active",
    },
  },
  {
    id: "pool3",
    attributes: {
      title: "Pool 3",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis. Maecenas ornare massa et pharetra suscipit. Sed ultrices, lacus...",
      logo: {
        _url: "",
      },
      coverImage: {
        _url: "",
      },
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 22000,
      totalInvoiceAmount: 16000,
      totalInvoices: 4,
      usdcRemaining: 6000,
      maturityDate: "2025-10-10T00:00:00.000Z",
      // New fields with different values
      developmentMethod: "65.20%",
      neweraScore: "5/5",
      fundSize: "300 M",
      generation: "Q4",
      economics: "1% - 25%",
      targetReturn: "4-5x gross",
      category: "Seed",
      stage: "Early/Seed",
      phase: "Fundraising",
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
    developmentMethod?: string;
    neweraScore?: string;
    fundSize?: string;
    generation?: string;
    economics?: string;
    targetReturn?: string;
    category?: string;
    stage?: string;
    phase?: string;
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
          _url: poolData.logo || "",
        },
        coverImage: {
          _url: poolData.coverImage || "",
        },
        creditType: poolData.creditType,
        totalUsdcDeposited: 0,
        totalInvoiceAmount: 0,
        totalInvoices: 0,
        usdcRemaining: 0,
        maturityDate: poolData.maturityDate.toISOString(),
        // New fields with default values if not provided
        developmentMethod: poolData.developmentMethod || "50.00%",
        neweraScore: poolData.neweraScore || "3/5",
        fundSize: poolData.fundSize || "100 M",
        generation: poolData.generation || "Q1",
        economics: poolData.economics || "2% - 15%",
        targetReturn: poolData.targetReturn || "2-3x gross",
        category: poolData.category || "Venture",
        stage: poolData.stage || "Early/Venture",
        phase: poolData.phase || "Active",
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
