import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { Form, InputNumber, message, Modal } from "antd";
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
import ParseClient from "@/services/ParseClient";
import { WalletPreference } from "@/utils/constants";
import { formatPrice } from "@/utils/currencyFormater";
import { formatNumber } from "@/utils/numberFormatter";

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

interface ProjectInfoField {
  key: string;
  value: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack }) => {
  const router = useRouter();
  const { walletPreference, dfnsToken, user } = useContext(UserContext);
  const [isFullyRepaid, setIsFullyRepaid] = useState<boolean>(false);
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
  const [investors, setInvestors] = useState<any[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfoField[]>([]);
  const requiredRule = { required: true, message: "This field is required." };
  const [paybackPoolform] = Form.useForm();
  const [isDepositEnabled, setIsDepositEnabled] = useState(false);
  const [collateralTokenHistory, setCollateralTokenHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollateralHistory = async () => {
      try {
        const data = await Parse.Cloud.run("getCollateralTokenHistory", {
          tradeDealId: String(project.tradeDealId),
        });
        setCollateralTokenHistory(data);
      } catch (err) {
        console.error("Failed to load collateral token history:", err);
      }
    };

    if (project.industryTemplate === Industries.TRADE_FINANCE && project.tradeDealId != null) {
      fetchCollateralHistory();
    }
  }, [project.tradeDealId, project.industryTemplate]);

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
          const parsedProjectInfo = JSON.parse(project?.projectInfo);
          setProjectInfo(parsedProjectInfo);
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

  useEffect(() => {
    const loadTradeDealStatus = async () => {
      if (project.industryTemplate === Industries.TRADE_FINANCE && project.tradeDealId != null) {
        try {
          const TradeDeal = Parse.Object.extend("TradeDeal");
          const query = new Parse.Query(TradeDeal);
          query.equalTo("tradeDealId", String(project.tradeDealId));
          const tradeDeal = await query.first();
          setIsFullyRepaid(tradeDeal?.get("isFullyRepaid") || false);
        } catch (error) {
          console.error("[UI] Error fetching trade deal status:", error);
        }
      }
    };

    loadTradeDealStatus();
  }, [project.tradeDealId, project.industryTemplate]);

  useEffect(() => {
    const loadInvestors = async () => {
      console.log("[UI] Calling cloud function getTradeDealInvestorSummary with ID:", project.tradeDealId);

      try {
        // admin role restricted route to grab call _Users table
        const { investors: investorData } = await Parse.Cloud.run("getTradeDealInvestorSummary", {
          tradeDealId: String(project.tradeDealId),
        });

        console.log("[UI] Received investor data from cloud function:", investorData);
        setInvestors(investorData);
      } catch (error) {
        console.error("[UI] Error fetching investors from cloud function:", error);
        toast.error("Failed to load investor data.");
      }
    };

    if (project.industryTemplate === Industries.TRADE_FINANCE && project.tradeDealId != null) {
      loadInvestors();
    }
  }, [project.tradeDealId, project.industryTemplate]);

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
                {project.industryTemplate === Industries.TRADE_FINANCE && project.tradeDealId != null ? (
                  <>
                    {Array.isArray(projectInfo) && projectInfo.length > 0 && (
                      <div
                        className={`mt-6 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark p-4 rounded-lg shadow-md transition-opacity duration-500 opacity-100`}
                        style={{ maxWidth: "100%", overflow: "hidden" }}
                      >
                        {projectInfo.map((item, index) => (
                          <div key={index} className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                            <span className="text-sm">{item.key}</span>
                            <h2 className="text-lg font-bold">{item.value}</h2>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={`mt-6 md:mt-0 flex flex-col md:flex-row md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark p-4 rounded-lg shadow-md transition-opacity duration-500 opacity-100`}
                    style={{ maxWidth: "100%", overflow: "hidden" }}
                  >
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Total Value</span>
                      <h2 className="text-lg font-bold">{formatNumber(project.totalValue)}</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Project Creation Date</span>
                      <h2 className="text-lg font-bold">{project.createdAt?.toLocaleDateString()}</h2>
                    </div>
                    <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                      <span className="text-sm">Tokens Available</span>
                      <h2 className="text-lg font-bold">{formatNumber(totalTokens)}</h2>
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
                    <span className="mt-2 font-semibold">
                      Current Funding: {formatPrice((project.isWithdrawn ? 0 : project.totalDepositAmount || 0) * 1e6, "USD")}
                    </span>
                    <Button
                      type="primary"
                      className="bg-red-500 hover:!bg-red-600"
                      onClick={() => setIsWithdrawModalVisible(true)}
                      disabled={project.isWithdrawn}
                      title={project.isWithdrawn ? "Project is already withdrawn" : ""}
                    >
                      Withdraw From Pool
                    </Button>

                    <Button
                      type="primary"
                      className="bg-green-500 hover:!bg-green-600"
                      onClick={() => setIsPaybackModalVisible(true)}
                      disabled={isFullyRepaid}
                      title={isFullyRepaid ? "This pool has been fully repaid" : ""}
                    >
                      Payback Pool
                    </Button>

                    <Button
                      type="primary"
                      className="bg-blue-500 hover:!bg-blue-600 mr-4"
                      onClick={() => router.push({ pathname: "/nft-create", query: { projectId: project.id } })}
                      disabled={project.isWithdrawn}
                      title={project.isWithdrawn ? "Project is already withdrawn" : ""}
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
                          children: <InvestorListView investors={investors} />,
                        },
                        // {
                        //   key: "3",
                        //   label: "Collateral Token History",
                        //   children: <CollateralTokenHistoryView records={collateralTokenHistory} />,
                        // },
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
                  await toast.promise(
                    (async () => {
                      // Get and validate tradeDealId
                      if (project.tradeDealId == null || typeof project.tradeDealId !== "number") {
                        throw new Error("Trade deal ID not found or invalid");
                      }
                      // Type assertion after validation
                      const tradeDealId = project.tradeDealId as number;

                      if (walletPreference === WalletPreference.PRIVATE) {
                        // Use BlockchainService for private wallet
                        const blockchainService = BlockchainService.getInstance();
                        if (!blockchainService) {
                          throw "Blockchain service not initialized";
                        }
                        // Non-null assertion after check
                        await blockchainService.withdrawTradeDealFunding(tradeDealId);
                      } else {
                        // Validate wallet credentials
                        if (!user?.walletId || !dfnsToken) {
                          throw "Wallet credentials not found";
                        }
                        // Type assertions after validation
                        const walletId = user.walletId as string;
                        const token = dfnsToken as string;

                        console.log("🔁 Calling dfnsWithdrawTradeDealFunding with:", {
                          walletId,
                          token,
                          tradeDealId,
                        });

                        console.log("addressss", user.walletAddress);

                        const withdrawResult = await DfnsService.dfnsWithdrawTradeDealFunding(walletId, token, tradeDealId, user.walletAddress);

                        if (withdrawResult.error) {
                          throw `Withdrawal failed: ${withdrawResult.error}`;
                        }
                      }
                    })(),
                    {
                      pending: "Withdrawing USDC...",
                      success: "USDC withdrawn successfully",
                      error: {
                        render({ data }: { data: any }) {
                          return <div>{data?.reason || data || "An error occurred during USDC withdraw."}</div>;
                        },
                      },
                    }
                  );

                  setIsWithdrawModalVisible(false);
                  project.isWithdrawn = true; // Set the flag to true on success
                  project.totalDepositAmount = 0; // Set total deposit amount to 0
                } catch (error) {
                  console.error("Withdrawal error:", error);
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
      {/* Payback Pool Modal */}
      <Modal
        open={isPaybackModalVisible}
        onCancel={() => {
          setIsPaybackModalVisible(false);
          setSelectedStocks([]);
          paybackPoolform.resetFields();
        }}
        footer={null}
        width={450} // Reduced width from 500 to 450
        className="payback-modal"
        centered
      >
        <div className="py-2 px-2">
          {" "}
          {/* Reduced vertical padding */}
          <h3 className="text-xl font-medium mb-2 text-center">Payback Pool</h3> {/* Smaller heading and margin */}
          {/* <p className="mb-4">Select Stocks to deposit</p> */}
          <div className="overflow-x-auto">
            {/* <table className="w-full">
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
      </table> */}
          </div>
          <div className="mb-2">
            {" "}
            {/* Reduced bottom margin */}
            {/* mt-4 flex justify-between items-center */}
            <div className="w-full">
              {/* <p>Selected: {selectedStocks.length}</p>
        <p>
          Total Amount:{" "}
          {mockInterestTokenHistory
            .filter((token) => selectedStocks.includes(token.id))
            .reduce((sum, token) => sum + token.total, 0)
            .toLocaleString()}
        </p> */}

              <p className="text-sm text-gray-500 mb-3">
                {" "}
                {/* Smaller margin */}
                Enter the amount you wish to repay to the trade deal pool. This will reduce the outstanding debt balance.
              </p>

              <Form
                form={paybackPoolform}
                layout="vertical"
                onValuesChange={(_, allValues) => {
                  const value = allValues.paybackPool;
                  setIsDepositEnabled(typeof value === "number" && value > 0);
                }}
              >
                <Form.Item rules={[requiredRule]} label={<span className="text-sm">Payback Amount (USDC)</span>} name="paybackPool" className="mb-1">
                  <InputNumber
                    placeholder="Enter amount"
                    className="w-full h-8 text-base"
                    min={0}
                    precision={2}
                    onKeyPress={(event) => {
                      if (!/[0-9.]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    prefix="$"
                    controls={{
                      upIcon: <span className="text-xs">▲</span>,
                      downIcon: <span className="text-xs">▼</span>,
                    }}
                    style={{ textAlign: "right" }}
                  />
                </Form.Item>
              </Form>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              {" "}
              <Button
                type="text"
                onClick={() => {
                  setIsPaybackModalVisible(false);
                  setSelectedStocks([]);
                  paybackPoolform.resetFields();
                }}
                className="h-10 px-5"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    await toast.promise(
                      (async () => {
                        // Get and validate tradeDealId
                        if (project.tradeDealId === null || project.tradeDealId === undefined || typeof project.tradeDealId !== "number") {
                          throw "Trade deal ID not found or invalid";
                        }
                        // Type assertion after validation
                        const tradeDealId = project.tradeDealId as number;
                        const paybackPoolValue = paybackPoolform.getFieldValue("paybackPool");
                        const paybackPool = (paybackPoolValue ?? 0) * 1_000_000;
                        if (walletPreference === WalletPreference.PRIVATE) {
                          // Use BlockchainService for private wallet
                          const blockchainService = BlockchainService.getInstance();
                          if (!blockchainService) {
                            throw "Blockchain service not initialized";
                          }
                          // Non-null assertion after check
                          await blockchainService.repayTradeDeal(tradeDealId, paybackPool);
                        } else {
                          // Validate wallet credentials
                          if (!user?.walletId || !dfnsToken) {
                            throw "Wallet credentials not found";
                          }
                          // Type assertions after validation
                          const walletId = user.walletId as string;
                          const token = dfnsToken as string;
                          const borrower = user.walletAddress as string;

                          const repayResult = await DfnsService.dfnsRepayTradeDeal(walletId, token, tradeDealId, paybackPool.toString(), borrower);

                          if (repayResult.error) {
                            throw `Repayment failed: ${repayResult.error}`;
                          }
                        }
                      })(),
                      {
                        pending: "Processing repayment...",
                        success: "Trade deal repaid successfully",
                        error: {
                          render({ data }: { data: any }) {
                            return <div>{data?.reason || data || "An error occurred during trade deal repaying."}</div>;
                          },
                        },
                      }
                    );

                    setIsPaybackModalVisible(false);
                    setIsFullyRepaid(true); // Set the flag to true on success
                    setSelectedStocks([]);
                    paybackPoolform.resetFields();
                  } catch (error) {
                    console.error("Repayment error:", error);
                  }
                }}
                disabled={!isDepositEnabled}
                className="h-10 px-6 !bg-[#2E5BFF] hover:!bg-[#2E5BFF]/80 disabled:!bg-[#D3D3D3] disabled:opacity-100 disabled:!text-[#4A4A4A]"
                style={{ borderRadius: "8px", minWidth: "100px" }}
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
