import React, { useState, useEffect } from "react";

import { ConfigProvider, theme } from "antd";
import { ThemeProvider, useTheme } from "next-themes";

import MockPrivateRoute from "@/components/atoms/MockPrivateRoute";
import ThemeToggle from "@/components/atoms/ThemeToggle";
import CreatePoolModal from "@/components/tradefi/CreatePoolModal";
import PoolCard from "@/components/tradefi/PoolCard";
import PoolDetails from "@/components/tradefi/PoolDetails";
import PoolListView from "@/components/tradefi/PoolListView";
import { MockNomyxAppProvider } from "@/context/MockNomyxAppContext";
import { MockUserProvider } from "@/context/MockUserContext";
import MockProviders from "@/context/MockWeb3Providers";

// Mock data for TradeFi pools
const mockPools = [
  {
    id: "pool1",
    title: "Pool 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis.",
    logo: "https://via.placeholder.com/150/6c5ce7/FFFFFF?text=P1",
    coverImage: "https://via.placeholder.com/800x400/6c5ce7/FFFFFF?text=Pool+1",
    creditType: "Trade Finance Invoice",
    totalUsdcDeposited: 477000,
    totalInvoiceAmount: 477000,
    totalInvoices: 4,
    usdcRemaining: 0,
    maturityDate: "2025-12-25T00:00:00.000Z",
  },
  {
    id: "pool2",
    title: "Pool 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis.",
    logo: "https://via.placeholder.com/150/8e44ad/FFFFFF?text=P2",
    coverImage: "https://via.placeholder.com/800x400/8e44ad/FFFFFF?text=Pool+2",
    creditType: "Trade Finance Invoice",
    totalUsdcDeposited: 22000,
    totalInvoiceAmount: 18000,
    totalInvoices: 4,
    usdcRemaining: 4000,
    maturityDate: "2025-11-15T00:00:00.000Z",
  },
  {
    id: "pool3",
    title: "Pool 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisl interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis.",
    logo: "https://via.placeholder.com/150/3498db/FFFFFF?text=P3",
    coverImage: "https://via.placeholder.com/800x400/3498db/FFFFFF?text=Pool+3",
    creditType: "Trade Finance Invoice",
    totalUsdcDeposited: 22000,
    totalInvoiceAmount: 16000,
    totalInvoices: 4,
    usdcRemaining: 6000,
    maturityDate: "2025-10-10T00:00:00.000Z",
  },
];

// Wrapper component to use hooks
function TradeFiPoolsDemoContent() {
  const [open, setOpen] = useState(false);
  const [poolList, setPoolList] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState("card");
  const [selectedPool, setSelectedPool] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPools = poolList.filter(
    (pool) => pool.title.toLowerCase().includes(searchQuery.toLowerCase()) || pool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePool = () => {
    setOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  const onCreateSuccess = () => {
    // In a real implementation, we would fetch the updated pools
    // For now, we'll just add a new mock pool
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    const newPool = {
      id: `pool${poolList.length + 1}`,
      title: `New Pool ${poolList.length + 1}`,
      description: "A newly created pool with mock data.",
      color: randomColor,
      creditType: "Trade Finance Invoice",
      totalUsdcDeposited: 0,
      totalInvoiceAmount: 0,
      totalInvoices: 0,
      usdcRemaining: 0,
      maturityDate: new Date().toISOString(),
    };

    setPoolList([...poolList, newPool]);
  };

  // Handle pool card or list item click
  const handlePoolClick = (pool: any) => {
    setSelectedPool(pool);
  };

  // Theme setup
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const isDarkMode = !mounted ? true : currentTheme === "dark";
  const algorithm = isDarkMode ? darkAlgorithm : defaultAlgorithm;

  const antTheme = {
    algorithm,
    components: {
      Layout: {
        headerBg: isDarkMode ? "#1f1f1f" : "#ffffff",
        colorBgBase: isDarkMode ? "#1f1f1f" : "#ffffff",
        colorBgContainer: isDarkMode ? "#1f1f1f" : "#ffffff",
        siderBg: isDarkMode ? "#1f1f1f" : "#ffffff",
      },
      Menu: {
        activeBarBorderWidth: 0,
      },
    },
  };

  if (!mounted) return null;

  return (
    <ConfigProvider theme={antTheme}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TradeFi Pools Demo</h1>
            <ThemeToggle />
          </div>

          <CreatePoolModal open={open} setOpen={setOpen} onCreateSuccess={onCreateSuccess} />

          {!selectedPool && (
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">TradeFi Pools</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage and explore trade finance pools</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <style jsx>{`
                      .search-input {
                        background: transparent !important;
                      }
                    `}</style>
                    <input
                      type="text"
                      placeholder="Search pools"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="search-input"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: "0.25rem",
                        borderWidth: "1px",
                        borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
                        color: isDarkMode ? "#f3f4f6" : "#111827",
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewModeChange("card")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "card"
                          ? "bg-[#3c89e8] text-white"
                          : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => handleViewModeChange("table")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "table"
                          ? "bg-[#3c89e8] text-white"
                          : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      List
                    </button>
                    <button onClick={handleCreatePool} className="p-2 rounded bg-[#3c89e8] hover:bg-[#2a7ad9] text-white transition-colors">
                      Create New Pool
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPool ? (
            // Render Pool Details
            <PoolDetails pool={selectedPool} onBack={() => setSelectedPool(null)} />
          ) : (
            <>
              {filteredPools.length > 0 ? (
                <>
                  {viewMode === "table" && <PoolListView pools={filteredPools} className="mt-5" onPoolClick={handlePoolClick} />}
                  {viewMode === "card" && (
                    <div className="gap-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-5">
                      {filteredPools.map((pool) => (
                        <PoolCard key={pool.id} pool={pool} onPoolClick={handlePoolClick} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col text-gray-900 dark:text-white h-[80%] items-center justify-center w-full grow py-20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M17.5 6.51L17.51 6.49889" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-4">No Pools around here?</p>
                  <p>Worry not! Let&apos;s create some</p>
                  <button onClick={handleCreatePool} className="mt-6 p-2 rounded bg-[#3c89e8] hover:bg-[#2a7ad9] text-white transition-colors">
                    Create New Pool
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default function TradeFiPoolsDemo() {
  return (
    <MockNomyxAppProvider>
      <MockUserProvider>
        <MockProviders>
          <MockPrivateRoute>
            <ThemeProvider attribute="class" enableSystem>
              <TradeFiPoolsDemoContent />
            </ThemeProvider>
          </MockPrivateRoute>
        </MockProviders>
      </MockUserProvider>
    </MockNomyxAppProvider>
  );
}
