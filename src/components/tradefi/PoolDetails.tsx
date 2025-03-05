import React, { useState } from "react";

import { Button, Card, Tabs, Typography, Table, Pagination } from "antd";
import { SearchNormal1, Category, RowVertical, ArrowLeft } from "iconsax-react";
import Image from "next/image";
import { useRouter } from "next/router";

import projectBackground from "../../assets/projects_background.png";

const { Title, Text, Paragraph } = Typography;

interface PoolDetailsProps {
  pool: {
    id: string;
    title: string;
    description: string;
    logo?: string;
    coverImage?: string;
    color?: string;
    creditType: string;
    totalUsdcDeposited: number;
    totalInvoiceAmount: number;
    totalInvoices: number;
    usdcRemaining: number;
    maturityDate?: string;
    // New fields based on the image
    developmentMethod?: string; // e.g. "52.53%"
    neweraScore?: string; // e.g. "4/5"
    fundSize?: string; // e.g. "200 M"
    generation?: string; // e.g. "Q3"
    economics?: string; // e.g. "2% - 20%"
    targetReturn?: string; // e.g. "3-4x gross"
    category?: string; // e.g. "Venture"
    stage?: string; // e.g. "Early/Venture"
    phase?: string; // e.g. "Closing soon"
  };
  onBack: () => void;
}

// Mock data for collateral token history
const mockCollateralHistory = [
  {
    key: "1",
    investorId: "53265985515",
    toHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 20000,
  },
  {
    key: "2",
    investorId: "53265985515",
    toHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 18000,
  },
  {
    key: "3",
    investorId: "53265985515",
    toHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 15000,
  },
  {
    key: "4",
    investorId: "53265985515",
    toHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 9000,
  },
];

// Mock data for interest token history
const mockInterestTokenHistory = [
  {
    key: "1",
    id: "53265985515",
    txHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 20000,
  },
  {
    key: "2",
    id: "53265985515",
    txHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 18000,
  },
  {
    key: "3",
    id: "53265985515",
    txHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 15000,
  },
  {
    key: "4",
    id: "53265985515",
    txHash: "0xd80b3332a4cdfd65df65df65df65df65df65",
    createdDate: "09-05-2024",
    total: 9000,
  },
];

const PoolDetails: React.FC<PoolDetailsProps> = ({ pool, onBack }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("table");
  const [activeTab, setActiveTab] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter collateral history based on search query
  const filteredCollateralHistory = mockCollateralHistory.filter(
    (item) =>
      item.investorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.toHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.createdDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.total.toString().includes(searchQuery)
  );

  // Filter interest token history based on search query
  const filteredInterestTokenHistory = mockInterestTokenHistory.filter(
    (item) =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.createdDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.total.toString().includes(searchQuery)
  );

  return (
    <div className="pool-details">
      {/* Pool Header Section */}
      <div
        className="pool-header relative p-6 rounded-lg"
        style={{
          backgroundImage: pool.coverImage
            ? `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%), url(${pool.coverImage})`
            : `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%), url(${projectBackground.src})`,
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

        {/* Pool Image, Title, and Description */}
        <div className="absolute sm:-bottom-2 bottom-4 left-0 md:flex md:flex-row flex-col items-start md:items-center p-4 rounded-lg w-full">
          {/* Pool Logo */}
          <div
            className="pool-logo rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{
              width: "150px",
              height: "150px",
              backgroundColor: pool.color || "#3c89e8",
              position: "relative",
            }}
          >
            {pool.logo ? (
              <Image src={pool.logo} alt="Pool Logo" fill style={{ objectFit: "cover" }} className="w-full h-full" />
            ) : (
              <span className="text-white text-4xl font-bold">{pool.title.charAt(0)}</span>
            )}
          </div>

          {/* Pool Title and Description */}
          <div className="text-white flex-1 mx-4 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold !text-nomyx-dark2-light dark:nomyx-dark2-dark">{pool.title}</h1>
            <p className="text-sm mt-2 max-w-md break-words !text-nomyx-dark2-light dark:nomyx-dark2-dark">{pool.description}</p>
          </div>

          {/* Pool Stats */}
          <div className="mt-6 md:mt-0 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark p-4 rounded-lg shadow-md transition-opacity duration-500 opacity-100">
            {/* First row of stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Development method</span>
                <h2 className="text-lg font-bold">{pool.developmentMethod || "52.53%"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Newera Score</span>
                <h2 className="text-lg font-bold">{pool.neweraScore || "4/5"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Fund Size</span>
                <h2 className="text-lg font-bold">{pool.fundSize || "200 M"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Generation</span>
                <h2 className="text-lg font-bold">{pool.generation || "Q3"}</h2>
              </div>
            </div>

            {/* Second row of stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Economics</span>
                <h2 className="text-lg font-bold">{pool.economics || "2% - 20%"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Target return</span>
                <h2 className="text-lg font-bold">{pool.targetReturn || "3-4x gross"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Category</span>
                <h2 className="text-lg font-bold">{pool.category || "Venture"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Stage</span>
                <h2 className="text-lg font-bold">{pool.stage || "Early/Venture"}</h2>
              </div>
              <div className="stat-item bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-3 rounded-lg text-center">
                <span className="text-sm">Phase</span>
                <h2 className="text-lg font-bold">{pool.phase || "Closing soon"}</h2>
              </div>
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

        {/* View Toggle */}
        <div className="flex items-center">
          {/* View Toggle Buttons */}
          <button
            onClick={() => setViewMode("card")}
            className={`p-0.5 rounded-sm mr-2 ${viewMode === "card" ? "bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-blue-light" : ""}`}
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
              label: "Pool Details",
              children: (
                <div className="p-4">
                  <Card className="mb-6 bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark">
                    <Title level={4} className="mb-4 text-nomyx-text-light dark:text-nomyx-text-dark">
                      Description
                    </Title>
                    <Paragraph className="text-nomyx-text-light dark:text-nomyx-text-dark">{pool.description}</Paragraph>
                  </Card>

                  {pool.maturityDate && (
                    <Card className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark">
                      <Title level={4} className="mb-4 text-nomyx-text-light dark:text-nomyx-text-dark">
                        Maturity Date
                      </Title>
                      <Paragraph className="text-nomyx-text-light dark:text-nomyx-text-dark">
                        {new Date(pool.maturityDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Paragraph>
                    </Card>
                  )}
                </div>
              ),
            },
            {
              key: "2",
              label: "Invoices",
              children: <div className="p-4">Invoice list will be implemented here</div>,
            },
            {
              key: "3",
              label: "Collateral Token History",
              children: (
                <div className="p-4">
                  <div className="mb-4">
                    <Text className="text-nomyx-text-light dark:text-nomyx-text-dark">{filteredCollateralHistory.length} items</Text>
                  </div>

                  <Table
                    dataSource={filteredCollateralHistory}
                    pagination={false}
                    className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
                    rowClassName="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                    columns={[
                      {
                        title: "Investor ID",
                        dataIndex: "investorId",
                        key: "investorId",
                        sorter: (a, b) => a.investorId.localeCompare(b.investorId),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "To Hash",
                        dataIndex: "toHash",
                        key: "toHash",
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Created Date",
                        dataIndex: "createdDate",
                        key: "createdDate",
                        sorter: (a, b) => a.createdDate.localeCompare(b.createdDate),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Total",
                        dataIndex: "total",
                        key: "total",
                        sorter: (a, b) => a.total - b.total,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                    ]}
                  />

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-nomyx-text-light dark:text-nomyx-text-dark">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredCollateralHistory.length)} -{" "}
                      {Math.min(currentPage * pageSize, filteredCollateralHistory.length)} of {filteredCollateralHistory.length} items
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredCollateralHistory.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      className="text-nomyx-text-light dark:text-nomyx-text-dark"
                    />
                  </div>
                </div>
              ),
            },
            {
              key: "4",
              label: "Interest Token History",
              children: (
                <div className="p-4">
                  <div className="mb-4">
                    <Text className="text-nomyx-text-light dark:text-nomyx-text-dark">{filteredInterestTokenHistory.length} items</Text>
                  </div>

                  <Table
                    dataSource={filteredInterestTokenHistory}
                    pagination={false}
                    className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
                    rowClassName="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                    columns={[
                      {
                        title: "ID",
                        dataIndex: "id",
                        key: "id",
                        sorter: (a, b) => a.id.localeCompare(b.id),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Tx Hash",
                        dataIndex: "txHash",
                        key: "txHash",
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Created Date",
                        dataIndex: "createdDate",
                        key: "createdDate",
                        sorter: (a, b) => a.createdDate.localeCompare(b.createdDate),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Total",
                        dataIndex: "total",
                        key: "total",
                        sorter: (a, b) => a.total - b.total,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                    ]}
                  />

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-nomyx-text-light dark:text-nomyx-text-dark">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredInterestTokenHistory.length)} -{" "}
                      {Math.min(currentPage * pageSize, filteredInterestTokenHistory.length)} of {filteredInterestTokenHistory.length} items
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredInterestTokenHistory.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      className="text-nomyx-text-light dark:text-nomyx-text-dark"
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PoolDetails;
