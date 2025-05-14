import React from "react";

import { DownloadOutlined } from "@ant-design/icons";
import { Table, Button } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";

import { formatPrice } from "@/utils/currencyFormater";

interface InvestorData {
  investorName: string;
  investorId: string;
  amountDeposited: number;
  collateralTokenIssued: number;
  collateralTokenLockupPeriod: string;
  interestTokensIssued: number;
}

interface InvestorListViewProps {
  investors: InvestorData[];
}

const InvestorListView: React.FC<InvestorListViewProps> = ({ investors }) => {
  const columns: ColumnsType<InvestorData> = [
    {
      title: "Investor Name",
      dataIndex: "investorName",
      key: "investorName",
      sorter: (a, b) => a.investorName.localeCompare(b.investorName),
    },
    {
      title: "Investor ID",
      dataIndex: "investorId",
      key: "investorId",
    },
    {
      title: "Amount Deposited ($)",
      dataIndex: "amountDeposited",
      key: "amountDeposited",
      sorter: (a, b) => a.amountDeposited - b.amountDeposited,
      render: (value) => (value != null ? formatPrice(value) : "-"),
    },
    //temporarily setting Collateral Token Issued amount equivalent to amount deposited
    {
      title: "Collateral Token Issued",
      dataIndex: "amountDeposited",
      key: "amountDeposited",
      sorter: (a, b) => a.amountDeposited - b.amountDeposited,
      render: (value) => (value != null ? formatPrice(value) : "-"),
    },
    // {
    //   title: "Collateral Token Lockup Period",
    //   dataIndex: "collateralTokenLockupPeriod",
    //   key: "collateralTokenLockupPeriod",
    // },
    // {
    //   title: "Interest Tokens Issued",
    //   dataIndex: "interestTokensIssued",
    //   key: "interestTokensIssued",
    //   sorter: (a, b) => a.interestTokensIssued - b.interestTokensIssued,
    //   render: (value) => value.toLocaleString(),
    // },
  ];

  const handleDownload = () => {
    // Filter columns to only include those with dataIndex
    const exportColumns = columns.filter((col): col is ColumnType<InvestorData> => "dataIndex" in col && typeof col.dataIndex === "string");

    // Convert data to CSV format
    const headers = exportColumns.map((col) => col.title).join(",");
    const rows = investors.map((investor) => {
      return exportColumns
        .map((col) => {
          const value = investor[col.dataIndex as keyof InvestorData];
          // Handle null values and formatting
          if (value === null || value === undefined) return "";
          if (col.dataIndex === "amountDeposited") return formatPrice(value as number).replace(/,/g, "");
          return value;
        })
        .join(",");
    });

    const csv = [headers, ...rows].join("\n");

    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "investors.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600">
          Download CSV
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={investors}
        rowKey="investorId"
        className="custom-table"
        pagination={{
          position: ["bottomCenter"],
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </>
  );
};

export default InvestorListView;
