import React, { useState } from "react";

import { Button, Card, Tabs, Typography, Table, Pagination, Select, Dropdown, Menu, message } from "antd";
import { SearchNormal1, Category, RowVertical, ArrowLeft, Eye } from "iconsax-react";
import Image from "next/image";
import { useRouter } from "next/router";

import PaybackPoolModal from "./PaybackPoolModal";
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

// Mock data for investors
const mockInvestors = [
  {
    key: "1",
    name: "Investor 01",
    id: "53265985515",
    amountDeposited: 20000,
    collateralTokenIssued: 20000,
    lockupPeriod: "5/365",
    interestTokensIssued: 20000,
  },
  {
    key: "2",
    name: "Investor 02",
    id: "53265985515",
    amountDeposited: 18000,
    collateralTokenIssued: 18000,
    lockupPeriod: "8/365",
    interestTokensIssued: 18000,
  },
  {
    key: "3",
    name: "Investor 03",
    id: "53265985515",
    amountDeposited: 15000,
    collateralTokenIssued: 15000,
    lockupPeriod: "2/365",
    interestTokensIssued: 15000,
  },
  {
    key: "4",
    name: "Investor 04",
    id: "53265985515",
    amountDeposited: 9000,
    collateralTokenIssued: 9000,
    lockupPeriod: "3/365",
    interestTokensIssued: 9000,
  },
];

// Mock data for invoices based on the design
const mockInvoices = [
  {
    key: "1",
    stockCertificateId: "Certificate 001247",
    tokenId: "53265985516",
    issuanceDate: "09-05-2024",
    heldBy: "Equity Trust Partners 1",
    maturityDate: "09-05-2025",
    companyName: "SpaceX",
    shareholderName: "SGH Capital",
    numberOfShares: 24000,
    classOfShares: "Class A",
    parValue: 100000,
    isinNumber: "53286",
    transferRestrictions: 100000,
  },
  {
    key: "2",
    stockCertificateId: "Certificate 001248",
    tokenId: "53265985517",
    issuanceDate: "09-05-2024",
    heldBy: "Equity Trust Partners 2",
    maturityDate: "09-05-2025",
    companyName: "SpaceX",
    shareholderName: "SGH Capital",
    numberOfShares: 24000,
    classOfShares: "Class A",
    parValue: 127000,
    isinNumber: "32651",
    transferRestrictions: 127000,
  },
  {
    key: "3",
    stockCertificateId: "Certificate 001249",
    tokenId: "53265985518",
    issuanceDate: "09-05-2024",
    heldBy: "Equity Trust Partners 3",
    maturityDate: "09-05-2025",
    companyName: "SpaceX",
    shareholderName: "SGH Capital",
    numberOfShares: 24000,
    classOfShares: "Class A",
    parValue: 50000,
    isinNumber: "26455",
    transferRestrictions: 50000,
  },
  {
    key: "4",
    stockCertificateId: "Certificate 001250",
    tokenId: "53265985519",
    issuanceDate: "09-05-2024",
    heldBy: "Equity Trust Partners 1",
    maturityDate: "09-05-2025",
    companyName: "SpaceX",
    shareholderName: "SGH Capital",
    numberOfShares: 24000,
    classOfShares: "Class A",
    parValue: 200000,
    isinNumber: "53200",
    transferRestrictions: 200000,
  },
];

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

// Mock data for payback pool invoices
const mockPaybackInvoices = [
  {
    key: "1",
    invoiceId: "53265985515",
    tokenId: "53265985515",
    amount: 20000,
  },
  {
    key: "2",
    invoiceId: "53265985515",
    tokenId: "53265985515",
    amount: 18000,
  },
  {
    key: "3",
    invoiceId: "53265985515",
    tokenId: "53265985515",
    amount: 15000,
  },
  {
    key: "4",
    invoiceId: "53265985515",
    tokenId: "53265985515",
    amount: 9000,
  },
];

const PoolDetails: React.FC<PoolDetailsProps> = ({ pool, onBack }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("table");
  const [activeTab, setActiveTab] = useState("2"); // Set to Invoices tab by default
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states for invoices tab
  const [issuanceDateFilter, setIssuanceDateFilter] = useState<string | null>(null);
  const [heldByFilter, setHeldByFilter] = useState<string | null>(null);
  const [maturityDateFilter, setMaturityDateFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [shareholderFilter, setShareholderFilter] = useState<string | null>(null);

  // Payback Pool Modal state
  const [paybackModalVisible, setPaybackModalVisible] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Payback Pool Modal handlers
  const handleOpenPaybackModal = () => {
    setPaybackModalVisible(true);
  };

  const handleClosePaybackModal = () => {
    setPaybackModalVisible(false);
  };

  const handleDepositPayback = (selectedItems: any[]) => {
    // Here you would implement the actual deposit functionality
    // For now, we'll just show a success message and close the modal
    message.success(
      `Successfully deposited ${selectedItems.length} items with a total amount of ${selectedItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}`
    );
    setPaybackModalVisible(false);
  };

  // Filter investors based on search query
  const filteredInvestors = mockInvestors.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amountDeposited.toString().includes(searchQuery) ||
      item.collateralTokenIssued.toString().includes(searchQuery) ||
      item.lockupPeriod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interestTokensIssued.toString().includes(searchQuery)
  );

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

  // Filter invoices based on search query and filter selections
  const filteredInvoices = mockInvoices.filter(
    (item) =>
      // Search query filter
      (item.stockCertificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.issuanceDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.heldBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.maturityDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shareholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.numberOfShares.toString().includes(searchQuery) ||
        item.classOfShares.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parValue.toString().includes(searchQuery) ||
        item.isinNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transferRestrictions.toString().includes(searchQuery)) &&
      // Dropdown filters
      (!issuanceDateFilter || item.issuanceDate === issuanceDateFilter) &&
      (!heldByFilter || item.heldBy === heldByFilter) &&
      (!maturityDateFilter || item.maturityDate === maturityDateFilter) &&
      (!companyFilter || item.companyName === companyFilter) &&
      (!shareholderFilter || item.shareholderName === shareholderFilter)
  );

  // Get unique values for filter dropdowns
  const uniqueIssuanceDates = Array.from(new Set(mockInvoices.map((item) => item.issuanceDate)));
  const uniqueHeldBy = Array.from(new Set(mockInvoices.map((item) => item.heldBy)));
  const uniqueMaturityDates = Array.from(new Set(mockInvoices.map((item) => item.maturityDate)));
  const uniqueCompanies = Array.from(new Set(mockInvoices.map((item) => item.companyName)));
  const uniqueShareholders = Array.from(new Set(mockInvoices.map((item) => item.shareholderName)));

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
              key: "2",
              label: "Stock Certificates",
              children: (
                <div className="p-4">
                  {/* Filter Dropdowns and Action Buttons */}
                  <div className="flex flex-wrap justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                      {/* Issuance Date Filter */}
                      <Select
                        placeholder={<span style={{ color: "#555555" }}>Issuance Date</span>}
                        className="w-36"
                        allowClear
                        value={issuanceDateFilter}
                        onChange={(value) => setIssuanceDateFilter(value)}
                        options={uniqueIssuanceDates.map((date) => ({ value: date, label: date }))}
                        style={{ borderColor: "#d9d9d9" }}
                      />

                      {/* Held By Filter */}
                      <Select
                        placeholder={<span style={{ color: "#555555" }}>Held By</span>}
                        className="w-56"
                        allowClear
                        value={heldByFilter}
                        onChange={(value) => setHeldByFilter(value)}
                        options={uniqueHeldBy.map((held) => ({ value: held, label: held }))}
                        style={{ borderColor: "#d9d9d9" }}
                      />

                      {/* Maturity Date Filter */}
                      <Select
                        placeholder={<span style={{ color: "#555555" }}>Maturity Date</span>}
                        className="w-36"
                        allowClear
                        value={maturityDateFilter}
                        onChange={(value) => setMaturityDateFilter(value)}
                        options={uniqueMaturityDates.map((date) => ({ value: date, label: date }))}
                        style={{ borderColor: "#d9d9d9" }}
                      />

                      {/* Company Filter */}
                      <Select
                        placeholder={<span style={{ color: "#555555" }}>Company</span>}
                        className="w-36"
                        allowClear
                        value={companyFilter}
                        onChange={(value) => setCompanyFilter(value)}
                        options={uniqueCompanies.map((company) => ({ value: company, label: company }))}
                        style={{ borderColor: "#d9d9d9" }}
                      />

                      {/* Shareholder Filter */}
                      <Select
                        placeholder={<span style={{ color: "#555555" }}>Shareholder</span>}
                        className="w-36"
                        allowClear
                        value={shareholderFilter}
                        onChange={(value) => setShareholderFilter(value)}
                        options={uniqueShareholders.map((shareholder) => ({ value: shareholder, label: shareholder }))}
                        style={{ borderColor: "#d9d9d9" }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button type="primary" danger className="bg-red-500 hover:bg-red-600">
                        Withdraw From Pool
                      </Button>
                      <Button type="primary" className="bg-green-500 hover:bg-green-600" onClick={handleOpenPaybackModal}>
                        Payback Pool
                      </Button>
                      <Button type="primary" className="bg-blue-500 hover:bg-blue-600">
                        Add Stock Certificate
                      </Button>
                    </div>
                  </div>

                  {/* Items Count */}
                  <div className="mb-4">
                    <Text className="text-nomyx-text-light dark:text-nomyx-text-dark">{filteredInvoices.length} items</Text>
                  </div>

                  {/* Invoices Table */}
                  <Table
                    dataSource={filteredInvoices}
                    pagination={false}
                    className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
                    rowClassName="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                    columns={[
                      {
                        title: "Stock Certificate ID",
                        dataIndex: "stockCertificateId",
                        key: "stockCertificateId",
                        sorter: (a, b) => a.stockCertificateId.localeCompare(b.stockCertificateId),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Token ID",
                        dataIndex: "tokenId",
                        key: "tokenId",
                        sorter: (a, b) => a.tokenId.localeCompare(b.tokenId),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Issuance Date",
                        dataIndex: "issuanceDate",
                        key: "issuanceDate",
                        sorter: (a, b) => a.issuanceDate.localeCompare(b.issuanceDate),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Held By",
                        dataIndex: "heldBy",
                        key: "heldBy",
                        sorter: (a, b) => a.heldBy.localeCompare(b.heldBy),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Maturity Date",
                        dataIndex: "maturityDate",
                        key: "maturityDate",
                        sorter: (a, b) => a.maturityDate.localeCompare(b.maturityDate),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Company Name",
                        dataIndex: "companyName",
                        key: "companyName",
                        sorter: (a, b) => a.companyName.localeCompare(b.companyName),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Shareholder Name",
                        dataIndex: "shareholderName",
                        key: "shareholderName",
                        sorter: (a, b) => a.shareholderName.localeCompare(b.shareholderName),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Number Of Shares",
                        dataIndex: "numberOfShares",
                        key: "numberOfShares",
                        sorter: (a, b) => a.numberOfShares - b.numberOfShares,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Class of Shares",
                        dataIndex: "classOfShares",
                        key: "classOfShares",
                        sorter: (a, b) => a.classOfShares.localeCompare(b.classOfShares),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Par Value",
                        dataIndex: "parValue",
                        key: "parValue",
                        sorter: (a, b) => a.parValue - b.parValue,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "ISIN Number",
                        dataIndex: "isinNumber",
                        key: "isinNumber",
                        sorter: (a, b) => a.isinNumber.localeCompare(b.isinNumber),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Transfer Restrictions",
                        dataIndex: "transferRestrictions",
                        key: "transferRestrictions",
                        sorter: (a, b) => a.transferRestrictions - b.transferRestrictions,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "",
                        key: "actions",
                        render: () => (
                          <div className="flex justify-center">
                            <Button type="text" icon={<Eye size="16" />} />
                          </div>
                        ),
                        width: 50,
                      },
                    ]}
                  />

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-nomyx-text-light dark:text-nomyx-text-dark">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredInvoices.length)} -{" "}
                      {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} items
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredInvoices.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      className="text-nomyx-text-light dark:text-nomyx-text-dark"
                    />
                  </div>
                </div>
              ),
            },
            {
              key: "1",
              label: "Investors",
              children: (
                <div className="p-4">
                  <div className="mb-4">
                    <Text className="text-nomyx-text-light dark:text-nomyx-text-dark">{filteredInvestors.length} items</Text>
                  </div>

                  <Table
                    dataSource={filteredInvestors}
                    pagination={false}
                    className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
                    rowClassName="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                    columns={[
                      {
                        title: "Investor Name",
                        dataIndex: "name",
                        key: "name",
                        sorter: (a, b) => a.name.localeCompare(b.name),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Investor ID",
                        dataIndex: "id",
                        key: "id",
                        sorter: (a, b) => a.id.localeCompare(b.id),
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Amount Deposited ($)",
                        dataIndex: "amountDeposited",
                        key: "amountDeposited",
                        sorter: (a, b) => a.amountDeposited - b.amountDeposited,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Collateral Token Issued",
                        dataIndex: "collateralTokenIssued",
                        key: "collateralTokenIssued",
                        sorter: (a, b) => a.collateralTokenIssued - b.collateralTokenIssued,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Collateral Token Lockup Period",
                        dataIndex: "lockupPeriod",
                        key: "lockupPeriod",
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                      {
                        title: "Interest Tokens Issued",
                        dataIndex: "interestTokensIssued",
                        key: "interestTokensIssued",
                        sorter: (a, b) => a.interestTokensIssued - b.interestTokensIssued,
                        render: (text) => `${text.toLocaleString()}`,
                        className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                      },
                    ]}
                  />

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-nomyx-text-light dark:text-nomyx-text-dark">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredInvestors.length)} -{" "}
                      {Math.min(currentPage * pageSize, filteredInvestors.length)} of {filteredInvestors.length} items
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredInvestors.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      className="text-nomyx-text-light dark:text-nomyx-text-dark"
                    />
                  </div>
                </div>
              ),
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

      {/* Payback Pool Modal */}
      <PaybackPoolModal
        visible={paybackModalVisible}
        onCancel={handleClosePaybackModal}
        onDeposit={handleDepositPayback}
        invoices={mockPaybackInvoices}
      />
    </div>
  );
};

export default PoolDetails;
