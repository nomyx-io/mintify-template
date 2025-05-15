import React from "react";

import { DownloadOutlined } from "@ant-design/icons";
import { Table, Button } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";

import { formatPrice } from "@/utils/currencyFormater";

interface DepositData {
  amount: number;
  depositedAt: Date;
}

interface InvestorData {
  investorName: string;
  investorId: string;
  amountDeposited: number;
  deposits: DepositData[];
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
    // Only include investor name and ID in base info
    const headers = ["Investor Name", "Investor ID", "Deposit Amount", "Deposit Date"].join(",");

    // Create rows with deposit details
    const rows = investors.flatMap((investor) => {
      const baseInfo = `${investor.investorName},${investor.investorId}`;

      // If no deposits, create one row with base info only
      if (!investor.deposits || investor.deposits.length === 0) {
        return [`${baseInfo},,`];
      }

      // Create a row for each deposit
      return investor.deposits.map((deposit) => {
        const depositAmount = formatPrice(deposit.amount).replace(/,/g, "");
        const depositDate = new Date(deposit.depositedAt).toISOString().replace("T", " ").slice(0, 16);
        return `${baseInfo},${depositAmount},${depositDate}`;
      });
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

  const expandedRowRender = (record: InvestorData) => {
    return (
      <div className="p-4 bg-gray-50">
        <h4 className="text-lg font-semibold mb-3">Deposit History</h4>
        <div className="space-y-2">
          {record.deposits.map((deposit, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatPrice(deposit.amount)}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(deposit.depositedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-end mb-4 pt-4 pr-4">
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600">
          Download CSV
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={investors}
        rowKey="investorId"
        className="custom-table"
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
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
