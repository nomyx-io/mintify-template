import React, { useEffect, useState, useMemo, useCallback } from "react";

import { message } from "antd";
import { Button, Card, Tabs } from "antd";
import { SearchNormal1, Category, RowVertical, ArrowLeft, Copy } from "iconsax-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import projectBackground from "@/assets/projects_background.png";
import TokenCardView from "@/components/projects/TokenCardView";
import TokenListView from "@/components/projects/TokenListView";
import { CustomerService } from "@/services/CustomerService";

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack }) => {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("table");
  const [showStats, setShowStats] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [refresh, setRefresh] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectTokens = await api.getProjectTokens(["projectId"], [project.id]);
        await Promise.all([fetchListings(projectTokens), fetchSales(projectTokens)]);
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
      fetchListings(projectTokens);
      fetchSales(projectTokens);
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

                {/* Project Stats (Move below on small screens) */}
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
                  onClick={() => router.push({ pathname: "/nft-create", query: { projectId: project.id } })}
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
                          <TokenListView
                            tokens={filteredListings}
                            isSalesHistory={false}
                            industryTemplate={project.industryTemplate}
                            setRefresh={setRefresh}
                          />
                        ) : (
                          <TokenCardView
                            tokens={filteredListings}
                            isSalesHistory={false}
                            industryTemplate={project.industryTemplate}
                            setRefresh={setRefresh}
                          />
                        )}
                      </>
                    ),
                  },
                  {
                    key: "2",
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
