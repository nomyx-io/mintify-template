import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { message, Modal } from "antd";
import { Button, Card, Tabs } from "antd";
import { SearchNormal1, Category, RowVertical, ArrowLeft, Copy } from "iconsax-react";
import Image from "next/image";
import { useRouter } from "next/router";
import Parse from "parse";
import { toast } from "react-toastify";

import projectBackground from "@/assets/projects_background.png";
import CollateralTokenHistoryView from "@/components/projects/CollateralTokenHistoryView";
import InterestTokenHistoryView from "@/components/projects/InterestTokenHistoryView";
import InvestorListView from "@/components/projects/InvestorListView";
import TokenCardView from "@/components/projects/TokenCardView";
import TokenListView from "@/components/projects/TokenListView";
import { Industries } from "@/constants/constants";
import { UserContext } from "@/context/UserContext";
import BlockchainService from "@/services/BlockchainService";
import { CustomerService } from "@/services/CustomerService";
import DfnsService from "@/services/DfnsService";
import { WalletPreference } from "@/utils/constants";

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack }) => {
  const router = useRouter();
  const { walletPreference, dfnsToken, user } = useContext(UserContext);
  const [listings, setListings] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [projectStockList, setProjectStockList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("table");
  const [showStats, setShowStats] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isPaybackModalVisible, setIsPaybackModalVisible] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const mockInterestTokenHistory = [
    {
      id: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 20000,
    },
    {
      id: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 18000,
    },
    {
      id: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 15000,
    },
    {
      id: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 9000,
    },
  ];

  const mockCollateralTokenHistory = [
    {
      investorId: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 20000,
    },
    {
      investorId: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 18000,
    },
    {
      investorId: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 15000,
    },
    {
      investorId: "53265985515",
      toHash: "0xdB0b3332a4cdfsdf55df65ddf65sdf65sdfs65sdf65",
      createdDate: "09-05-2024",
      total: 9000,
    },
  ];

  const mockInvestors = [
    {
      investorName: "Investor 01",
      investorId: "53265985515",
      amountDeposited: 20000,
      collateralTokenIssued: 20000,
      collateralTokenLockupPeriod: "5/365",
      interestTokensIssued: 20000,
    },
    {
      investorName: "Investor 02",
      investorId: "53265985515",
      amountDeposited: 18000,
      collateralTokenIssued: 18000,
      collateralTokenLockupPeriod: "8/365",
      interestTokensIssued: 18000,
    },
    {
      investorName: "Investor 03",
      investorId: "53265985515",
      amountDeposited: 15000,
      collateralTokenIssued: 15000,
      collateralTokenLockupPeriod: "2/365",
      interestTokensIssued: 15000,
    },
    {
      investorName: "Investor 04",
      investorId: "53265985515",
      amountDeposited: 9000,
      collateralTokenIssued: 9000,
      collateralTokenLockupPeriod: "3/365",
      interestTokensIssued: 9000,
    },
  ];

  const api = useMemo(() => CustomerService(), []);

  const searchAllProperties = (item: any, query: string): boolean => {
    const searchInObject = (obj: any): boolean => {
      for (let key in obj) {
        const value = obj[key];
        if (typeof value === "string" && value.toLowerCase().includes(query.toLowerCase())) {
          return true;
        } else if (typeof value === "number" && value.toString().includes(query)) {
          return true;
        } else if (typeof value === "object" && value !== null) {
          if (searchInObject(value)) {
            return true;
          }
        }
      }
      return false;
    };

    return searchInObject(item);
  };

  // Memoize the filtered listings, sales, and stocks
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => searchAllProperties(listing, searchQuery));
  }, [listings, searchQuery]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => searchAllProperties(sale, searchQuery));
  }, [sales, searchQuery]);

  const filteredStocks = useMemo(() => {
    return projectStockList.filter((stock) => searchAllProperties(stock, searchQuery));
  }, [projectStockList, searchQuery]);

  // Handle search bar input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      if (window.innerWidth < 1500) {
        setShowStats(false); // Hide stats on small screens
      } else {
        setShowStats(true); // Show stats on larger screens
      }
    };
    // Set initial visibility
    handleResize();
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectTokens = await api.getProjectTokens(["projectId"], [project.id]);

        if (project.industryTemplate === Industries.TRADE_FINANCE) {
          // For trade finance template, populate projectStockList
          setProjectStockList(projectTokens);
        } else {
          // For other templates, fetch listings and sales as before
          await Promise.all([fetchListings(projectTokens), fetchSales(projectTokens)]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [refresh, project.id]);

  const fetchListings = useCallback(
    async (projectTokens: any) => {
      try {
        const projectTokens = await api.getProjectTokens(["projectId"], [project.id]);
        const listingData = await api.getListings(["sold"], [false]);

        // Create a Set of tokenIds for faster lookups
        const projectTokenIds = new Set(projectTokens.map((token: any) => token.tokenId));

        // Filter listings to include only those part of the project and not sold
        let filteredListings = listingData.filter((listing: any) => projectTokenIds.has(listing.tokenId));
        filteredListings.forEach((listing: any) => {
          const matchedToken = projectTokens.find((t: any) => t.tokenId === listing.tokenId);
          listing.depositAmount = matchedToken?.depositAmount ?? 0; // Default to 0 if not found
        });
        setListings(filteredListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    },
    [api, project.id]
  );

  const fetchSales = useCallback(
    async (projectTokens: any) => {
      try {
        const salesData = await api.getSales();

        // filter sold tokens based off of the fetched listings tokens id
        const projectSalesData = salesData.filter((sale: any) => {
          return projectTokens.some((listing: any) => String(listing.tokenId) === String(sale.tokenId));
        });
        const filteredSalesData = projectSalesData.map((sale: { token: { price: string; existingCredits: string } }) => {
          return {
            ...sale,
            price: Number(sale.token.price),
          };
        });
        setSales(filteredSalesData || []);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    },
    [api]
  );

  // Fetch listings and sales when component mounts
  useEffect(() => {
    console.log("Fetching data for project:", project);
    const fetchData = async () => {
      const projectTokens = await api.getProjectTokens(["projectId"], [project.id]);

      if (project.industryTemplate === Industries.TRADE_FINANCE) {
        // For trade finance template, populate projectStockList
        setProjectStockList(projectTokens);
      } else {
        // For other templates, fetch listings and sales as before
        fetchListings(projectTokens);
        fetchSales(projectTokens);
      }
    };
    fetchData();
  }, [api, project, project.id, project.title, fetchListings, fetchSales]);

  const totalTokens = listings.length + sales.length;
  return (
    <div className="project-details">
      {selectedToken ? (
        <>{/* Token Detail View */}</>
      ) : (
        <>
          {/* Project Details View */}
          <div className="project-details">
            {/* Project Header Section */}
            <div
              className="project-header relative p-6 rounded-lg"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%), url(${projectBackground.src})`,
                backgroundSize: "cover",
                backgroundPosition: "top center",
                height: "500px",
              }}
            >
              {/* Back Button */}
              <button
                onClick={onBack}
                className="absolute top-4 left-4 sm:left-auto sm:right-4 lg:left-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark text-nomyx-text-light dark:text-nomyx-text-dark rounded-md flex items-center px-4 py-2 shadow-md w-[100px]"
              >
                <ArrowLeft size="24" className="mr-2" />
                Back
              </button>

              {/* Project Image, Title, and Description */}
              <div className="absolute sm:-bottom-2 bottom-4 left-0 md:flex md:flex-row flex-col items-start md:items-center p-4 rounded-lg w-full">
                {/* Project Image */}
                <div className="project-logo rounded-lg overflow-hidden flex-shrink-0" style={{ width: "100px", height: "100px" }}>
                  <Image src={project.logo?.url()} alt="Project Logo" width={100} height={25} className="object-cover w-full h-full" />
                </div>

                {/* Project Title and Description */}
                <div className="text-white flex-1 mx-4 mt-4 md:mt-0">
                  <h1 className="text-3xl font-bold !text-nomyx-dark2-light dark:nomyx-dark2-dark">{project.title}</h1>
                  <p className="text-sm mt-2 max-w-md break-words !text-nomyx-dark2-light dark:nomyx-dark2-dark">{project.description}</p>
                </div>

                {/* Project Stats */}
                {project.industryTemplate === Industries.TRADE_FINANCE ? (
                  <div
                    className={`mt-6 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark p-4 rounded-lg shadow-md transition-opacity duration-500 opacity-100`}
                    style={{ maxWidth: "100%", overflow: "hidden" }}
                  >
                    {/* Top Row */}
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Development method</span>
                      <h2 className="text-lg font-bold">52.53%</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Newera Score</span>
                      <h2 className="text-lg font-bold">4/5</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Fund Size</span>
                      <h2 className="text-lg font-bold">200 M</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Generation</span>
                      <h2 className="text-lg font-bold">03</h2>
                    </div>

                    {/* Bottom Row */}
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Economics</span>
                      <h2 className="text-lg font-bold">2% - 20%</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Target return</span>
                      <h2 className="text-lg font-bold">3-4x Gross</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Category</span>
                      <h2 className="text-lg font-bold">Venture</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Stage</span>
                      <h2 className="text-lg font-bold">Early/Venture</h2>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mt-6 md:mt-0 flex flex-col md:flex-row md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark p-4 rounded-lg shadow-md transition-opacity duration-500 opacity-100`}
                    style={{ maxWidth: "100%", overflow: "hidden" }}
                  >
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Total Value</span>
                      <h2 className="text-lg font-bold">{Intl.NumberFormat("en-US").format(project.totalValue)}</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Project Creation Date</span>
                      <h2 className="text-lg font-bold">{project.createdAt?.toLocaleDateString()}</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Total Tokens</span>
                      <h2 className="text-lg font-bold">{totalTokens}</h2>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Header Section with Search Bar */}
            <div className="flex justify-between items-center p-2 rounded-lg bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark text-nomyx-text-light dark:text-nomyx-text-dark mt-4">
              {/* Search Bar */}
              <div className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark flex-shrink-0 w-64 flex items-center rounded-sm h-8 py-1 px-2">
                <SearchNormal1 size="24" />
                <input
                  type="text"
                  placeholder="Search all columns"
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark ml-2 w-full focus:outline-none"
                  onChange={handleSearchChange}
                  value={searchQuery}
                />
              </div>

              {/* View Toggle and Purchase Selected Button */}
              <div className="flex items-center">
                {project.industryTemplate === Industries.TRADE_FINANCE ? (
                  <div className="flex gap-2">
                    <Button type="primary" className="bg-red-500 hover:!bg-red-600" onClick={() => setIsWithdrawModalVisible(true)}>
                      Withdraw From Pool
                    </Button>

                    <Button type="primary" className="bg-green-500 hover:!bg-green-600" onClick={() => setIsPaybackModalVisible(true)}>
                      Payback Pool
                    </Button>

                    <Button
                      type="primary"
                      className="bg-blue-500 hover:!bg-blue-600 mr-4"
                      onClick={() => router.push({ pathname: "/nft-create", query: { projectId: project.id } })}
                    >
                      Add Stock Certificate
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    className="mr-4 bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark'"
                    onClick={() => router.push({ pathname: "/nft-create", query: { projectId: project.id } })}
                  >
                    Mint Token
                  </Button>
                )}

                {/* View Toggle Buttons */}
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-0.5 rounded-sm mr-2 ${
                    viewMode === "card" ? "bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-blue-light" : ""
                  }`}
                >
                  <Category size="20" variant={viewMode === "card" ? "Bold" : "Linear"} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-0.5 rounded-sm ${viewMode === "table" ? "bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-blue-light" : ""}`}
                >
                  <RowVertical size="20" variant={viewMode === "table" ? "Bold" : "Linear"} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <Card className="no-padding border-nomyx-gray4-light dark:border-nomyx-gray4-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark mt-4">
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                className="nftTabs"
                items={[
                  {
                    key: "1",
                    label: project.industryTemplate === Industries.TRADE_FINANCE ? "Stocks" : "Current Listings",
                    children: (
                      <>
                        {viewMode === "table" ? (
                          <TokenListView
                            tokens={project.industryTemplate === Industries.TRADE_FINANCE ? filteredStocks : filteredListings}
                            isSalesHistory={false}
                            industryTemplate={project.industryTemplate}
                            setRefresh={setRefresh}
                          />
                        ) : (
                          <TokenCardView
                            tokens={project.industryTemplate === Industries.TRADE_FINANCE ? filteredStocks : filteredListings}
                            isSalesHistory={false}
                            industryTemplate={project.industryTemplate}
                            setRefresh={setRefresh}
                          />
                        )}
                      </>
                    ),
                  },
                  ...(project.industryTemplate === Industries.TRADE_FINANCE
                    ? [
                        {
                          key: "2",
                          label: "Investors",
                          children: <InvestorListView investors={mockInvestors} />,
                        },
                        {
                          key: "3",
                          label: "Collateral Token History",
                          children: <CollateralTokenHistoryView records={mockCollateralTokenHistory} />,
                        },
                        {
                          key: "4",
                          label: "Interest Token History",
                          children: <InterestTokenHistoryView records={mockInterestTokenHistory} />,
                        },
                      ]
                    : []),
                  ...(project.industryTemplate !== Industries.TRADE_FINANCE
                    ? [
                        {
                          key: "3",
                          label: "Sales History",
                          children:
                            viewMode === "table" ? (
                              <TokenListView
                                tokens={filteredSales}
                                isSalesHistory={true}
                                industryTemplate={project.industryTemplate}
                                setRefresh={setRefresh}
                              />
                            ) : (
                              <TokenCardView
                                tokens={filteredSales}
                                isSalesHistory={true}
                                industryTemplate={project.industryTemplate}
                                setRefresh={setRefresh}
                              />
                            ),
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
          </div>
        </>
      )}

      {/* Withdraw Modal */}
      <Modal open={isWithdrawModalVisible} onCancel={() => setIsWithdrawModalVisible(false)} footer={null} width={500} className="withdraw-modal">
        <div className="text-center py-4">
          <h3 className="text-lg font-medium mb-4">Are you sure you want to withdraw from pool?</h3>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setIsWithdrawModalVisible(false)} className="px-8 text-blue-500">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  // Get and validate tradeDealId
                  if (!project.tradeDealId || typeof project.tradeDealId !== "number") {
                    throw new Error("Trade deal ID not found or invalid");
                  }
                  // Type assertion after validation
                  const tradeDealId = project.tradeDealId as number;

                  if (walletPreference === WalletPreference.PRIVATE) {
                    // Use BlockchainService for private wallet
                    const blockchainService = BlockchainService.getInstance();
                    if (!blockchainService) {
                      throw new Error("Blockchain service not initialized");
                    }
                    // Non-null assertion after check
                    await blockchainService!.withdrawTradeDealFunding(tradeDealId);
                  } else {
                    // Validate wallet credentials
                    if (!user?.walletId || !dfnsToken) {
                      throw new Error("Wallet credentials not found");
                    }
                    // Type assertions after validation
                    const walletId = user.walletId as string;
                    const token = dfnsToken as string;

                    const withdrawResult = await DfnsService.dfnsWithdrawTradeDealFunding(walletId, token, tradeDealId);

                    if (withdrawResult.error) {
                      throw new Error(`Withdrawal failed: ${withdrawResult.error}`);
                    }
                  }

                  message.success("USDC withdrawn successfully");
                  setIsWithdrawModalVisible(false);
                } catch (error: any) {
                  console.error("Withdrawal error:", error);
                  message.error(`Failed to withdraw: ${error.message}`);
                }
              }}
              className="bg-blue-500 hover:!bg-blue-600 px-8"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payback Pool Modal */}
      <Modal
        open={isPaybackModalVisible}
        onCancel={() => {
          setIsPaybackModalVisible(false);
          setSelectedStocks([]);
        }}
        footer={null}
        width={800}
        className="payback-modal"
      >
        <div className="py-4">
          <h3 className="text-xl font-medium mb-4">Payback Pool</h3>
          <p className="mb-4">Select Stocks to deposit</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark">
                  <th className="p-3 text-left"></th>
                  <th className="p-3 text-left">Stock ID</th>
                  <th className="p-3 text-left">Token ID</th>
                  <th className="p-3 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockInterestTokenHistory.map((token, index) => (
                  <tr key={index} className="border-b border-nomyx-dark1-light dark:border-nomyx-dark1-dark">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedStocks.includes(token.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStocks([...selectedStocks, token.id]);
                          } else {
                            setSelectedStocks(selectedStocks.filter((id) => id !== token.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3">{token.id}</td>
                    <td className="p-3">{token.id}</td>
                    <td className="p-3">{token.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <p>Selected: {selectedStocks.length}</p>
              <p>
                Total Amount:{" "}
                {mockInterestTokenHistory
                  .filter((token) => selectedStocks.includes(token.id))
                  .reduce((sum, token) => sum + token.total, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                type="text"
                onClick={() => {
                  setIsPaybackModalVisible(false);
                  setSelectedStocks([]);
                }}
                className="text-[#2E5BFF] hover:!text-black"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    // Get and validate tradeDealId
                    if (!project.tradeDealId || typeof project.tradeDealId !== "number") {
                      throw new Error("Trade deal ID not found or invalid");
                    }
                    // Type assertion after validation
                    const tradeDealId = project.tradeDealId as number;

                    if (walletPreference === WalletPreference.PRIVATE) {
                      // Use BlockchainService for private wallet
                      const blockchainService = BlockchainService.getInstance();
                      if (!blockchainService) {
                        throw new Error("Blockchain service not initialized");
                      }
                      // Non-null assertion after check
                      await blockchainService!.repayTradeDeal(tradeDealId, 200);
                    } else {
                      // Validate wallet credentials
                      if (!user?.walletId || !dfnsToken) {
                        throw new Error("Wallet credentials not found");
                      }
                      // Type assertions after validation
                      const walletId = user.walletId as string;
                      const token = dfnsToken as string;

                      const repayResult = await DfnsService.dfnsRepayTradeDeal(walletId, token, tradeDealId, "200");

                      if (repayResult.error) {
                        throw new Error(`Repayment failed: ${repayResult.error}`);
                      }
                    }

                    message.success("Trade deal repaid successfully");
                    setIsPaybackModalVisible(false);
                    setSelectedStocks([]);
                  } catch (error: any) {
                    console.error("Deposit error:", error);
                    message.error(`Failed to repay: ${error.message}`);
                  }
                }}
                disabled={selectedStocks.length === 0}
                className="!bg-[#2E5BFF] hover:!bg-[#2E5BFF]/80 disabled:!bg-[#D3D3D3] disabled:opacity-100 disabled:!text-[#4A4A4A]"
                style={{ width: "200px", borderRadius: "8px" }}
              >
                Deposit
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ProjectDetails;
