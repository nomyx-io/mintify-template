import React from "react";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Typography, Row, Col, Statistic } from "antd";
import Image from "next/image";

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
  };
  onBack: () => void;
}

const PoolDetails: React.FC<PoolDetailsProps> = ({ pool, onBack }) => {
  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} className="mb-4 text-nomyx-text-light dark:text-nomyx-text-dark">
        Back to Pools
      </Button>

      <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
        <div
          className="w-full h-full"
          style={{
            backgroundColor: pool.color || "#3c89e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          {pool.title}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
          <div className="flex items-center gap-4">
            <div
              className="h-20 w-20 rounded-full overflow-hidden shadow-md flex items-center justify-center"
              style={{
                backgroundColor: pool.color || "#3c89e8",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {pool.title.charAt(0)}
            </div>
            <div>
              <Title level={2} className="text-white m-0">
                {pool.title}
              </Title>
              <Text className="text-gray-200">{pool.creditType}</Text>
            </div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic title="Total USDC Deposited" value={pool.totalUsdcDeposited} precision={2} prefix="$" valueStyle={{ color: "#3c89e8" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic title="Total Invoice Amount" value={pool.totalInvoiceAmount} precision={2} prefix="$" valueStyle={{ color: "#3c89e8" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic title="Total Invoices" value={pool.totalInvoices} valueStyle={{ color: "#3c89e8" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic title="USDC Remaining" value={pool.usdcRemaining} precision={2} prefix="$" valueStyle={{ color: "#3c89e8" }} />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Title level={4} className="mb-4 text-nomyx-text-light dark:text-nomyx-text-dark">
          Description
        </Title>
        <Paragraph className="text-gray-600 dark:text-gray-400">{pool.description}</Paragraph>
      </Card>

      {pool.maturityDate && (
        <Card>
          <Title level={4} className="mb-4 text-nomyx-text-light dark:text-nomyx-text-dark">
            Maturity Date
          </Title>
          <Paragraph className="text-gray-600 dark:text-gray-400">
            {new Date(pool.maturityDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Paragraph>
        </Card>
      )}
    </div>
  );
};

export default PoolDetails;
