import React, { useEffect, useState, useMemo } from "react";
import { message } from "antd";
import { Button, Card, Tabs } from "antd";
import { KronosService } from "@/services/KronosService";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import TokenCardView from "@/components/projects/TokenCardView";
import TokenListView from "@/components/projects/TokenListView";
import MarketPlaceTokenDetail from "@/components/projects/MarketPlaceTokenDetail";
import { SearchNormal1, Category, RowVertical, ArrowLeft, Copy } from "iconsax-react";
import projectBackground from "@/assets/projects_background.png";

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

const copyURL = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success("Copied to clipboard!");
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack }) => {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("table");
  const [showStats, setShowStats] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const api = useMemo(() => KronosService(), []);

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

  // Memoize the filtered listings and sales
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => searchAllProperties(listing, searchQuery));
  }, [listings, searchQuery]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => searchAllProperties(sale, searchQuery));
  }, [sales, searchQuery]);

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

  const handleDetailsClick = (token: any) => {
    setSelectedToken(token);
  };

  const handleBackToListings = () => {
    setSelectedToken(null);
  };

  // Fetch listings and sales when component mounts
  useEffect(() => {
    const fetchData = async () => {
      await fetchListings();
      await fetchSales();
    };
    fetchData();
  }, []);

  const fetchListings = async () => {
    try {
      const newListingData = await api.getProjectTokens(["projectId"], [project.id]);
      setListings(newListingData || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const fetchSales = async () => {
    const newSalesData = await api.getSales();
    setSales(newSalesData.map((sale: {token: {price: string, existingCredits: string}}) => {
      return {
        ...sale,
        price: (Number(sale.token.price) * Number(sale.token.existingCredits))
    }}) || []);
  };

  // Function to handle individual token purchase
  const handleIndividualPurchase = async (token: any) => {
    toast.promise(
      async () => {
        try {
          await api.purchaseTokens([token]);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          setListings((prevListings) => prevListings.filter((item) => item.tokenId !== token.tokenId));
          await fetchSales(); // Refresh sales list if needed
        } catch (e) {
          console.log(e);
          throw e;
        }
      },
      {
        pending: `Purchasing token ${token.tokenId}...`,
        success: `Successfully purchased token ${token.tokenId}`,
        error: {
          render({ data }: { data: any }) {
            return <div>{data?.reason || `An error occurred while purchasing token ${token.tokenId}`}</div>;
          },
        },
      }
    );
  };

  const handleNextToken = () => {
    const currentIndex = filteredListings.findIndex((listing) => listing.tokenId === selectedToken.tokenId);
    // Move to the next token, or loop to the first if at the end
    const nextIndex = (currentIndex + 1) % filteredListings.length;
    setSelectedToken(filteredListings[nextIndex]);
  };

  const handlePreviousToken = () => {
    const currentIndex = filteredListings.findIndex((listing) => listing.tokenId === selectedToken.tokenId);
    // Move to the previous token, or loop to the last if at the beginning
    const prevIndex = (currentIndex - 1 + filteredListings.length) % filteredListings.length;
    setSelectedToken(filteredListings[prevIndex]);
  };

  const totalTokens = listings.length + sales.length;
  return (
    <div className="project-details">
      {selectedToken ? (
        <>
          {/* Token Detail View */}
          <MarketPlaceTokenDetail token={selectedToken} next={handleNextToken} prev={handlePreviousToken} onBack={handleBackToListings} />
        </>
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
                onClick={onBack} // Use the onBack function to reset the view
                className="absolute top-4 left-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark !text-nomyx-dark2-light dark:nomyx-dark2-dark rounded-md flex items-center px-4 py-2 shadow-md"
              >
                <ArrowLeft size="24" className="mr-2" />
                Back
              </button>

              {/* Project Image, Title, and Description */}
              <div className="absolute bottom-4 left-0 flex items-center p-4 rounded-lg">
                {/* Project Image */}
                <div className="project-logo rounded-lg overflow-hidden" style={{ width: "100px", height: "100px" }}>
                  <img src={project.coverImage?.url()} alt="Project Logo" className="object-cover w-full h-full" />
                </div>

                {/* Project Title and Description */}
                <div className="text-white flex-1 mx-4">
                  <h1 className="text-3xl font-bold !text-nomyx-dark2-light dark:nomyx-dark2-dark">{project.title}</h1>
                  <p className="text-sm mt-2 max-w-md break-words !text-nomyx-dark2-light dark:nomyx-dark2-dark">{project.description}</p>
                </div>
              </div>

              {/* Project Stats (Hide when screen width is small enough to cause overlap) */}
              <div
                className={`absolute bottom-4 right-4 flex flex-nowrap space-x-4 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark p-4 rounded-lg shadow-md transition-opacity duration-500 ${
                  showStats ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                style={{ overflow: "hidden" }}
              >
                <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                  <span className="text-sm">Credit Type</span>
                  <h2 className="text-lg font-bold">Carbon Credit</h2>
                </div>
                <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                  <span className="text-sm">Carbon Offset (Tons)</span>
                  <h2 className="text-lg font-bold">{project.totalCarbon}</h2>
                </div>
                <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                  <span className="text-sm">Project Creation Date</span>
                  <h2 className="text-lg font-bold">{project.createdAt?.toLocaleDateString()}</h2>
                </div>
                <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                  <span className="text-sm">Total Tokens</span>
                  <h2 className="text-lg font-bold">{totalTokens}</h2>
                </div>
                <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                  <span className="text-sm">Registry</span>
                  <div className="flex justify-between items-center max-w-[150px] mx-auto">
                    <h2 className="text-lg font-bold truncate">{project.registryName}</h2>
                  </div>
                </div>
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
                <Button
                  type="primary"
                  className="mr-4 bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark'"
                  onClick={() => router.push(`/nft-create?projectId=${project.id}`)}
                >
                  Mint Token
                </Button>

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
                    label: "Current Listings",
                    children: (
                      <>
                        {viewMode === "table" ? (
                          <TokenListView tokens={filteredListings} onProjectClick={handleDetailsClick} isSalesHistory={false} />
                        ) : (
                          <TokenCardView tokens={filteredListings} onTokenClick={handleDetailsClick} isSalesHistory={false} />
                        )}
                      </>
                    ),
                  },
                  {
                    key: "2",
                    label: "Sales History",
                    children:
                      viewMode === "table" ? (
                        <TokenListView tokens={filteredSales} onProjectClick={handleDetailsClick} isSalesHistory={true} />
                      ) : (
                        <TokenCardView tokens={filteredSales} onTokenClick={handleDetailsClick} isSalesHistory={true} />
                      ),
                  },
                ]}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
export default ProjectDetails;
