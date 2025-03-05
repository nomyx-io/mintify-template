import React from "react";

import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import Image from "next/image";

const { Text } = Typography;

interface PoolListViewProps {
  pools: any[];
  className?: string;
  onPoolClick: (pool: any) => void;
}

const PoolListView: React.FC<PoolListViewProps> = ({ pools, className = "", onPoolClick }) => {
  const columns: ColumnsType<any> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div
            className="relative h-10 w-10 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: record.color || "#3c89e8",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {text.charAt(0)}
          </div>
          <Text className="font-medium text-gray-900 dark:text-white">{text}</Text>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <Text className="text-gray-600 dark:text-gray-400 line-clamp-2">{text}</Text>,
    },
    {
      title: "Credit Type",
      dataIndex: "creditType",
      key: "creditType",
      render: (text) => <Text className="text-gray-900 dark:text-white">{text}</Text>,
    },
    {
      title: "Total USDC deposited",
      dataIndex: "totalUsdcDeposited",
      key: "totalUsdcDeposited",
      render: (value) => <Text className="text-gray-900 dark:text-white">$ {value.toLocaleString()}</Text>,
    },
    {
      title: "Total Invoice Amount",
      dataIndex: "totalInvoiceAmount",
      key: "totalInvoiceAmount",
      render: (value) => <Text className="text-gray-900 dark:text-white">$ {value.toLocaleString()}</Text>,
    },
    {
      title: "Total Invoices",
      dataIndex: "totalInvoices",
      key: "totalInvoices",
      render: (value) => <Text className="text-gray-900 dark:text-white">{value}</Text>,
    },
    {
      title: "USDC remaining",
      dataIndex: "usdcRemaining",
      key: "usdcRemaining",
      render: (value) => <Text className="text-gray-900 dark:text-white">$ {value.toLocaleString()}</Text>,
    },
  ];

  return (
    <div className={className}>
      <Table
        columns={columns}
        dataSource={pools.map((pool) => ({ ...pool, key: pool.id }))}
        className="bg-white dark:bg-gray-800"
        onRow={(record) => ({
          onClick: () => onPoolClick(record),
          className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
        })}
        pagination={{
          position: ["bottomCenter"],
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          defaultPageSize: 5,
        }}
      />
    </div>
  );
};

export default PoolListView;
