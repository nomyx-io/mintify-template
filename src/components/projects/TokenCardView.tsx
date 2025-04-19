import React, { useState } from "react";

import { Card, Modal, Input, Button } from "antd";
import { MoneyRecive } from "iconsax-react";
import { toast } from "react-toastify";

import { Industries } from "@/constants/constants";
import { DepositService } from "@/services/DepositService";
import { ColumnConfig, EXCLUDED_COLUMNS, ColumnData } from "@/types/dynamicTableColumn";
import { hashToColor } from "@/utils/colorUtils";
import { formatPrice } from "@/utils/currencyFormater";

import { GenerateSvgIcon } from "../atoms/TokenSVG";

const depositService = DepositService();

interface TokenCardViewProps {
  tokens: any[];
  isSalesHistory: boolean;
  industryTemplate?: string;
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

const TokenCardView: React.FC<TokenCardViewProps> = ({ tokens, isSalesHistory, industryTemplate, setRefresh }) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>(""); // State for the input value
  const [isSubmitting, setIsSubmitting] = useState(false); // For submission state
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDepositClick = (tokenId: string) => {
    console.log("tokenId", tokenId);
    setSelectedTokenId(tokenId);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTokenId(null);
    setAmount("");
  };

  const handleDepositSubmit = async () => {
    let result = await depositService.getTotalDepositAmountAndTokenPrice(selectedTokenId || "0");
    let totalDepositAmount = result?.totalAmount / 1_000_000 || 0;
    totalDepositAmount = totalDepositAmount + Number(amount);
    if (result?.price >= totalDepositAmount) {
      console.log(`Token ID: ${selectedTokenId}, Amount: ${amount}`);
      setIsSubmitting(true);
      try {
        const depositToast = toast.loading("Making a deposit...");
        await depositService.deposit(selectedTokenId, amount);
        toast.update(depositToast, {
          render: `Deposit successfully made for Token ID ${selectedTokenId}`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        // Add your submission logic here
        setIsModalVisible(false);
        setAmount("");
        setIsSubmitting(false);
        setRefresh?.((prev) => !prev);
      } catch (e) {
        toast.dismiss();
        let errorMessage = "Failed to deposit.";
        if (e instanceof Error) {
          errorMessage = e.message;
        } else if (typeof e === "string") {
          errorMessage = e;
        }
        console.error(e);
        toast.error(errorMessage);
        setIsSubmitting(false);
      }
    } else {
      toast.warning("The total deposited amount exceeds the token price.");
    }
  };

  const getDynamicColumns = (maxColumns = 5): ColumnConfig[] => {
    const nonNullColumns: Record<string, ColumnConfig> = {};
    tokens.forEach((token) => {
      if (industryTemplate != Industries.TRADE_FINANCE) {
        Object.entries(token.token).forEach(([key, value]) => {
          if (value != null && !(key in nonNullColumns) && !EXCLUDED_COLUMNS.has(key)) {
            nonNullColumns[key] = {
              title: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
              key,
            };
          }
        });
      } else {
        Object.entries(token).forEach(([key, value]) => {
          if (value != null && !(key in nonNullColumns) && !EXCLUDED_COLUMNS.has(key)) {
            nonNullColumns[key] = {
              title: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
              key,
            };
          }
        });
      }
    });
    return Object.values(nonNullColumns).slice(0, maxColumns);
  };

  const dynamicColumns = getDynamicColumns();

  return (
    <div className="grid gap-5 grid-cols-2 xl:grid-cols-3 mt-5 p-5">
      {tokens.length === 0 ? (
        <div className="col-span-2 xl:col-span-3 text-center p-10 bg-gray-100 rounded-lg text-black text-lg">No data</div>
      ) : (
        tokens.map((token) => {
          const tokenId = token.tokenId ?? "default";
          const color = hashToColor(tokenId);

          // Create column data for each token
          const dynamicColumnData: ColumnData[] = dynamicColumns.map((column) => ({
            label: column.title,
            value: industryTemplate != Industries.TRADE_FINANCE ? token.token?.[column.key] : token?.[column.key] || "-",
          }));

          return (
            <Card
              key={tokenId}
              className={`rounded-lg shadow-md transition-shadow duration-200 ease-in-out bg-white dark:bg-nomyx-dark2-dark text-nomyx-text-light dark:text-nomyx-text-dark relative ${
                !isSalesHistory ? "hover:shadow-2xl hover:scale-105" : ""
              }`}
              style={{
                padding: "0",
                overflow: "hidden",
                boxSizing: "border-box",
                transform: !isSalesHistory ? "translateY(0)" : "translateY(-10px)",
                transition: "transform 0.3s ease-in-out",
              }}
            >
              {/* Logo Section */}
              <div
                className="logo-container"
                style={{
                  width: "100%",
                  height: "40%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                  boxSizing: "border-box",
                }}
              >
                <GenerateSvgIcon color={color} />
              </div>

              {/* Content Section */}
              <div className="p-4">
                {/* Title and Description */}
                <h2 className="text-lg font-bold">{token?.nftTitle || token.token?.nftTitle || "Token Title"}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {token?.description ||
                    token.token?.description ||
                    "This is a placeholder description for the token. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                </p>

                {/* Token Details Section */}
                <div className="mt-4 grid gap-2">
                  {[
                    ...(token.price > 0
                      ? [
                          {
                            label: "Total Price",
                            value: isSalesHistory ? formatPrice(token.price, "USD") : formatPrice(token.price / 1_000_000, "USD"),
                          },
                        ]
                      : []),
                    ...dynamicColumnData,
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-semibold text-left">{item.label}</span>
                      <span className="bg-gray-100 dark:bg-nomyx-dark1-dark p-2 rounded text-right w-2/3">{item.value}</span>
                    </div>
                  ))}
                  {industryTemplate && industryTemplate === Industries.TOKENIZED_DEBT && (
                    <>
                      <div key="deposit" className="flex items-center justify-between">
                        <span className="font-semibold text-left">Deposit</span>
                        <span className="bg-gray-100 dark:bg-nomyx-dark1-dark p-2 rounded text-right w-2/3">
                          <MoneyRecive className="cursor-pointer float-right" onClick={() => handleDepositClick(tokenId)} />
                        </span>
                      </div>
                      <div key="depositAmount" className="flex items-center justify-between">
                        <span className="font-semibold text-left">Deposited Amount</span>
                        <span className="bg-gray-100 dark:bg-nomyx-dark1-dark p-2 rounded text-right w-2/3">
                          {formatPrice(token?.depositAmount / 1_000_000, "USD")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}

      <Modal
        title={`Deposit for Token ID: ${selectedTokenId}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null} // Custom footer for Submit and Cancel buttons
      >
        <div>
          <p>Enter the deposit amount:</p>
          <Input placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" required />
        </div>
        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <Button onClick={handleModalClose} style={{ marginRight: "8px" }} className="text-black">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleDepositSubmit}
            disabled={!amount || isSubmitting}
            className={`text-blue-600 border-blue-600 ${!amount || isSubmitting ? "!text-gray-400 !border-gray-400" : ""}`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TokenCardView;
