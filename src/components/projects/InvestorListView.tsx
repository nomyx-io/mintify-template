import React from "react";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

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
      render: (value) => (value / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      title: "Collateral Token Issued",
      dataIndex: "collateralTokenIssued",
      key: "collateralTokenIssued",
      sorter: (a, b) => a.collateralTokenIssued - b.collateralTokenIssued,
      render: (value) =>
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
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

  return (
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
  );
};

export default InvestorListView;
