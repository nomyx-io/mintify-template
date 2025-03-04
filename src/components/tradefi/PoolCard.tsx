import React from "react";

import { Card, Typography } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

interface PoolCardProps {
  pool: {
    id: string;
    title: string;
    description: string;
    logo: string;
    coverImage: string;
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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => onPoolClick(pool)}
      cover={
        <div className="relative h-40 w-full">
          <Image
            src={pool.coverImage || "https://via.placeholder.com/800x400/cccccc/FFFFFF?text=Cover"}
            alt={pool.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
          />
          <div className="absolute top-4 left-4 h-16 w-16 rounded-full overflow-hidden bg-white shadow-md">
            <Image
              src={pool.logo || "https://via.placeholder.com/150/cccccc/FFFFFF?text=Logo"}
              alt={`${pool.title} logo`}
              fill
              sizes="64px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      }
    >
      <div className="p-4">
        <Title level={4} className="mb-2 text-nomyx-text-light dark:text-nomyx-text-dark">
          {pool.title}
        </Title>
        <Text className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{pool.description}</Text>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text className="text-gray-500 dark:text-gray-400 block">Credit Type</Text>
            <Text className="font-medium text-nomyx-text-light dark:text-nomyx-text-dark">{pool.creditType}</Text>
          </div>

          <div>
            <Text className="text-gray-500 dark:text-gray-400 block">Total USDC deposited</Text>
            <Text className="font-medium text-nomyx-text-light dark:text-nomyx-text-dark">$ {pool.totalUsdcDeposited.toLocaleString()}</Text>
          </div>

          <div>
            <Text className="text-gray-500 dark:text-gray-400 block">Total Invoice Amount</Text>
            <Text className="font-medium text-nomyx-text-light dark:text-nomyx-text-dark">$ {pool.totalInvoiceAmount.toLocaleString()}</Text>
          </div>

          <div>
            <Text className="text-gray-500 dark:text-gray-400 block">Total Invoices</Text>
            <Text className="font-medium text-nomyx-text-light dark:text-nomyx-text-dark">{pool.totalInvoices}</Text>
          </div>

          <div className="col-span-2">
            <Text className="text-gray-500 dark:text-gray-400 block">USDC remaining</Text>
            <Text className="font-medium text-nomyx-text-light dark:text-nomyx-text-dark">$ {pool.usdcRemaining.toLocaleString()}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PoolCard;
