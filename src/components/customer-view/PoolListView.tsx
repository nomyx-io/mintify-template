import React from "react";

import { EyeOutlined } from "@ant-design/icons";
import { Table, Typography, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import Image from "next/image";

const { Text } = Typography;

interface PoolListViewProps {
  pools: any[];
  className?: string;
  onPoolClick: (pool: any) => void;
}

const PoolListView: React.FC<PoolListViewProps> = ({ pools, className = "", onPoolClick }) => {
  // Mock data for the new columns
  const mockPoolData = pools.map((pool) => ({
    ...pool,
    totalInvestedAmount: pool.totalUsdcDeposited || 62000,
    totalAllocatedVABI: pool.totalUsdcDeposited || 62000,
    totalVABIEarned: pool.totalUsdcDeposited * 0.08 || 4960,
    totalVABIYield: pool.totalUsdcDeposited * 0.08 || 4960,
    vabiYieldPercentage: pool.title === "Pool 1" ? "8%" : "7%",
  }));

  const columns: ColumnsType<any> = [
    {
      title: "Pool Name",
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
              position: "relative",
            }}
          >
            {record.logo ? <Image src={record.logo} alt={`${text} Logo`} fill style={{ objectFit: "cover" }} /> : text.charAt(0)}
          </div>
          <Text className="font-medium text-gray-900 dark:text-white">{text}</Text>
        </div>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Maturity Date",
      dataIndex: "maturityDate",
      key: "maturityDate",
      render: (text) => <Text className="text-gray-900 dark:text-white">{text || "09-05-2024"}</Text>,
      sorter: (a, b) => new Date(a.maturityDate || "09-05-2024").getTime() - new Date(b.maturityDate || "09-05-2024").getTime(),
    },
    {
      title: "Total Invested Amount",
      dataIndex: "totalInvestedAmount",
      key: "totalInvestedAmount",
      render: (value) => <Text className="text-gray-900 dark:text-white">{value.toLocaleString()}</Text>,
      sorter: (a, b) => a.totalInvestedAmount - b.totalInvestedAmount,
    },
    {
      title: "Total Allocated VABI",
      dataIndex: "totalAllocatedVABI",
      key: "totalAllocatedVABI",
      render: (value) => <Text className="text-gray-900 dark:text-white">{value.toLocaleString()}</Text>,
      sorter: (a, b) => a.totalAllocatedVABI - b.totalAllocatedVABI,
    },
    {
      title: "Total VABI Earned",
      dataIndex: "totalVABIEarned",
      key: "totalVABIEarned",
      render: (value) => <Text className="text-gray-900 dark:text-white">{value.toLocaleString()}</Text>,
      sorter: (a, b) => a.totalVABIEarned - b.totalVABIEarned,
    },
    {
      title: "Total VABI Yield",
      dataIndex: "totalVABIYield",
      key: "totalVABIYield",
      render: (value) => <Text className="text-gray-900 dark:text-white">{value.toLocaleString()}</Text>,
      sorter: (a, b) => a.totalVABIYield - b.totalVABIYield,
    },
    {
      title: "VABI Yield Percentage",
      dataIndex: "vabiYieldPercentage",
      key: "vabiYieldPercentage",
      render: (value) => <Text className="text-gray-900 dark:text-white">{value}</Text>,
      sorter: (a, b) => parseFloat(a.vabiYieldPercentage) - parseFloat(b.vabiYieldPercentage),
    },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onPoolClick(record);
            }}
            className="flex items-center justify-center"
          />
        </div>
      ),
    },
    {
      title: "",
      key: "collateralSwap",
      render: () => (
        <Button type="primary" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => e.stopPropagation()}>
          Swap Collateral Token to USDC
        </Button>
      ),
    },
    {
      title: "",
      key: "dividendSwap",
      render: () => (
        <Button type="primary" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => e.stopPropagation()}>
          Swap Dividend Token to USDC
        </Button>
      ),
    },
  ];

  return (
    <div className={className}>
      <Table
        columns={columns}
        dataSource={mockPoolData.map((pool) => ({ ...pool, key: pool.id }))}
        className="bg-white dark:bg-gray-800"
        onRow={(record) => ({
          className: "hover:bg-gray-50 dark:hover:bg-gray-800",
        })}
        pagination={{
          position: ["bottomCenter"],
          showSizeChanger: false,
          defaultPageSize: 10,
          className: "mt-4",
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default PoolListView;
