import React from "react";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface CollateralTokenHistoryRecord {
  investorId: string;
  toHash: string;
  createdDate: string;
  total: number;
}

interface CollateralTokenHistoryViewProps {
  records: CollateralTokenHistoryRecord[];
}

const CollateralTokenHistoryView: React.FC<CollateralTokenHistoryViewProps> = ({ records }) => {
  const columns: ColumnsType<CollateralTokenHistoryRecord> = [
    {
      title: "Investor ID",
      dataIndex: "investorId",
      key: "investorId",
      sorter: (a, b) => a.investorId.localeCompare(b.investorId),
    },
    {
      title: "Tx Hash",
      dataIndex: "toHash",
      key: "toHash",
      ellipsis: true,
      render: (hash: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_ETHERSCAN_BASE_URL || "https://sepolia.basescan.org/tx/";
        return (
          <a href={`${baseUrl}${hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {hash.slice(0, 6)}...{hash.slice(-4)}
          </a>
        );
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (value) => `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  ];

  return <Table columns={columns} dataSource={records} rowKey="toHash" className="custom-table" pagination={{ pageSize: 10 }} />;
};

export default CollateralTokenHistoryView;
