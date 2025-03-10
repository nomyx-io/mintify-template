import React from "react";

import { Button, Card, Typography, Table, Divider } from "antd";
import { ArrowLeft } from "iconsax-react";
import Image from "next/image";

const { Title, Text, Paragraph } = Typography;

interface StockCertificatePreviewProps {
  stockCertificate: {
    id: string;
    tokenId: string;
    title: string;
    description: string;
    fullDescription: string[];
    stockInfo: {
      type: string;
      stage: string;
      market: string;
      fundSize: string;
      generation: string;
      economics: string;
      openingDate: string;
      closingDate: string;
      targetReturn: string;
    };
    documents?: {
      type: string;
      url: string;
    }[];
  };
  onBack: () => void;
  onAddStock: () => void;
}

const StockCertificatePreview: React.FC<StockCertificatePreviewProps> = ({ stockCertificate, onBack, onAddStock }) => {
  return (
    <div className="stock-certificate-preview">
      <Card className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark mb-4">
        <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark mb-4">
          Details
        </Title>

        <div className="flex flex-col md:flex-row">
          {/* Stock Certificate Image and Description */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0 md:mr-6">
            <div className="w-full h-64 bg-gray-800 rounded-lg overflow-hidden relative">
              {/* This would be the actual image in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src="https://placehold.co/400x400/3c89e8/FFFFFF.png?text=Stock+Certificate" alt="Stock Certificate" width={400} height={400} />
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <Title level={3} className="text-nomyx-text-light dark:text-nomyx-text-dark">
              Stock {stockCertificate.id} - Token ID {stockCertificate.tokenId}
            </Title>

            <Paragraph className="text-nomyx-text-light dark:text-nomyx-text-dark">{stockCertificate.description}</Paragraph>

            <Divider className="my-4 border-gray-600" />

            <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark">
              Full Description
            </Title>
            <ul className="list-none pl-0">
              {stockCertificate.fullDescription.map((item, index) => (
                <li key={index} className="text-nomyx-text-light dark:text-nomyx-text-dark mb-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Divider className="my-6 border-gray-600" />

        {/* Stock Information */}
        <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark mb-4">
          Stock Information
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Table
              dataSource={[
                {
                  key: "1",
                  label: "Type of Investment:",
                  value: stockCertificate.stockInfo.type,
                },
                {
                  key: "2",
                  label: "Market:",
                  value: stockCertificate.stockInfo.market,
                },
                {
                  key: "3",
                  label: "Generation:",
                  value: stockCertificate.stockInfo.generation,
                },
                {
                  key: "4",
                  label: "Opening Date:",
                  value: stockCertificate.stockInfo.openingDate,
                },
                {
                  key: "5",
                  label: "Target Return (Gross):",
                  value: stockCertificate.stockInfo.targetReturn,
                },
              ]}
              columns={[
                {
                  title: "",
                  dataIndex: "label",
                  key: "label",
                  width: "50%",
                  className: "text-nomyx-text-light dark:text-nomyx-text-dark font-medium",
                },
                {
                  title: "",
                  dataIndex: "value",
                  key: "value",
                  className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                },
              ]}
              pagination={false}
              showHeader={false}
              size="small"
              className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
              rowClassName="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
            />
          </div>

          <div>
            <Table
              dataSource={[
                {
                  key: "1",
                  label: "Stage:",
                  value: stockCertificate.stockInfo.stage,
                },
                {
                  key: "2",
                  label: "Fund Size:",
                  value: stockCertificate.stockInfo.fundSize,
                },
                {
                  key: "3",
                  label: "Economics:",
                  value: stockCertificate.stockInfo.economics,
                },
                {
                  key: "4",
                  label: "Closing Date:",
                  value: stockCertificate.stockInfo.closingDate,
                },
              ]}
              columns={[
                {
                  title: "",
                  dataIndex: "label",
                  key: "label",
                  width: "50%",
                  className: "text-nomyx-text-light dark:text-nomyx-text-dark font-medium",
                },
                {
                  title: "",
                  dataIndex: "value",
                  key: "value",
                  className: "text-nomyx-text-light dark:text-nomyx-text-dark",
                },
              ]}
              pagination={false}
              showHeader={false}
              size="small"
              className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
              rowClassName="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
            />
          </div>
        </div>

        <Divider className="my-6 border-gray-600" />

        {/* Related Documentation */}
        <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark mb-4">
          Related Documentation
        </Title>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stockCertificate.documents?.map((doc, index) => (
            <div key={index} className="text-center">
              <div className="w-full h-32 bg-red-600 rounded-lg mb-2 flex items-center justify-center">
                <Text className="text-white text-lg">PDF</Text>
              </div>
              <Text className="text-nomyx-text-light dark:text-nomyx-text-dark block">{doc.type}</Text>
              <div className="flex justify-center mt-2 space-x-2">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 space-x-4">
        <Button onClick={onBack} icon={<ArrowLeft size="16" />} className="bg-gray-200 text-gray-800">
          Back
        </Button>
        <Button type="primary" onClick={onAddStock} className="bg-blue-600">
          Add Stock
        </Button>
      </div>
    </div>
  );
};

export default StockCertificatePreview;
