import React, { useState } from "react";

import { Button, message, Typography } from "antd";
import { useRouter } from "next/router";

import { TelescopeIcon } from "@/assets";
import StockCertificateForm from "@/components/stock-certificates/StockCertificateForm";
import StockCertificatePreview from "@/components/stock-certificates/StockCertificatePreview";
import { getDashboardLayout } from "@/Layouts";

const { Title } = Typography;

export default function StockCertificates() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [stockCertificates, setStockCertificates] = useState<any[]>([]);

  const router = useRouter();

  // Mock data for stock certificates
  const mockStockCertificate = {
    id: "001248",
    tokenId: "500",
    title: "Stock 0012548 - Token ID 500",
    description:
      "Description text, lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at tincidunt ex. Vivamus varius nulla eget nisi interdum sollicitudin eget at turpis. Integer ut interdum velit, sed maximus turpis. Maecenas ornare massa et pharetra suscipit. Sed ultrices, lacus eu vestibulum rhoncus, risus quam lacinia dui, laculis molestie leo dui non nulla. Phasellus neque dolor, molestie ut hendrerit id, aliquet a sapien.",
    fullDescription: [
      "Wi-Fi6e chip sets - Qualcomm FastConnect 6900",
      "QTY - 100,000",
      "Country of Origin - China",
      "Pallet Number - 5001",
      "Serial Number Range - 5344559 - 63445599",
      "Airway Bill Number/Bill Of Landing: FZA312353",
    ],
    stockInfo: {
      type: "Venture",
      stage: "Early",
      market: "US",
      fundSize: "$ 5 M",
      generation: "Q3",
      economics: "2% - 20%",
      openingDate: "09-03-2025",
      closingDate: "09-03-2026",
      targetReturn: "3-4 X",
    },
    documents: [
      { type: "PPM", url: "#" },
      { type: "Custodian Contract", url: "#" },
      { type: "Stock Certificate", url: "#" },
    ],
  };

  const handleFormSubmit = (values: any) => {
    // In a real application, you would send this data to your backend
    console.log("Form values:", values);

    // Convert fullDescription from string to array by splitting by newlines
    const formattedValues = {
      ...values,
      id: values.id || "001248", // Default ID if not provided
      tokenId: values.tokenId || "500", // Default token ID if not provided
      fullDescription: values.fullDescription ? values.fullDescription.split("\n").filter((line: string) => line.trim() !== "") : [],
      stockInfo: {
        type: values.tokenType || "Venture",
        stage: values.stage || "Early",
        market: values.market || "US",
        fundSize: values.fundSize ? `$ ${values.fundSize} M` : "$ 5 M",
        generation: values.generation || "Q3",
        economics: values.economics || "2% - 20%",
        openingDate: values.openingDate ? values.openingDate.format("MM-DD-YYYY") : "09-03-2025",
        closingDate: values.closingDate ? values.closingDate.format("MM-DD-YYYY") : "09-03-2026",
        targetReturn: values.targetReturn || "3-4 X",
      },
      documents: [
        { type: "PPM", url: "#" },
        { type: "Custodian Contract", url: "#" },
        { type: "Stock Certificate", url: "#" },
      ],
    };

    setFormData(formattedValues);
    setIsPreviewMode(true);
    message.success("Stock certificate created successfully!");
  };

  const handleAddStock = () => {
    // In a real application, you would send this data to your backend
    setStockCertificates([...stockCertificates, formData || mockStockCertificate]);
    setIsPreviewMode(false);
    setFormData(null);
    message.success("Stock certificate added successfully!");
  };

  const handleBack = () => {
    setIsPreviewMode(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={4} className="m-0">
          {isPreviewMode ? "Preview Stock Tokenization" : "Stock Tokenization"}
        </Title>
      </div>

      {isPreviewMode ? (
        <StockCertificatePreview stockCertificate={formData || mockStockCertificate} onBack={handleBack} onAddStock={handleAddStock} />
      ) : (
        <StockCertificateForm onSubmit={handleFormSubmit} />
      )}
    </div>
  );
}

StockCertificates.getLayout = getDashboardLayout;
