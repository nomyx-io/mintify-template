import React from "react";

import { Card, Typography } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

interface PoolCardProps {
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
  };
  onPoolClick: (pool: any) => void;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, onPoolClick }) => {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
      onClick={() => onPoolClick(pool)}
      cover={
        <div className="relative h-40 w-full">
          <div
            className="w-full h-full rounded-t-lg bg-blue-500 relative"
            style={{
              backgroundColor: pool.color || "#3c89e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {pool.coverImage ? <Image src={pool.coverImage} alt={`${pool.title} Cover`} fill style={{ objectFit: "cover" }} /> : pool.title}
          </div>
        </div>
      }
    >
      <div className="p-4">
        <Title level={4} className="mb-2 text-gray-900 dark:text-white">
          {pool.title}
        </Title>
        <Text className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{pool.description}</Text>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text className="text-gray-700 dark:text-gray-400 block">Credit Type</Text>
            <Text className="font-medium text-gray-900 dark:text-white">{pool.creditType}</Text>
          </div>

          <div>
            <Text className="text-gray-700 dark:text-gray-400 block">Total USDC deposited</Text>
            <Text className="font-medium text-gray-900 dark:text-white">$ {pool.totalUsdcDeposited.toLocaleString()}</Text>
          </div>

          <div>
            <Text className="text-gray-700 dark:text-gray-400 block">Total Invoice Amount</Text>
            <Text className="font-medium text-gray-900 dark:text-white">$ {pool.totalInvoiceAmount.toLocaleString()}</Text>
          </div>

          <div>
            <Text className="text-gray-700 dark:text-gray-400 block">Total Invoices</Text>
            <Text className="font-medium text-gray-900 dark:text-white">{pool.totalInvoices}</Text>
          </div>

          <div className="col-span-2">
            <Text className="text-gray-700 dark:text-gray-400 block">USDC remaining</Text>
            <Text className="font-medium text-gray-900 dark:text-white">$ {pool.usdcRemaining.toLocaleString()}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PoolCard;
