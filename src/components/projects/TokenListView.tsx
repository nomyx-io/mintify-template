import React, { useState, useEffect, useContext } from "react";

import { EyeOutlined } from "@ant-design/icons";
import { Table, Switch, Modal, Input, Button } from "antd";
import { ethers } from "ethers";
import { MoneyRecive, Eye } from "iconsax-react";
import { toast } from "react-toastify";

import { Industries } from "@/constants/constants";
import BlockchainService from "@/services/BlockchainService";
import { DepositService } from "@/services/DepositService";
import DfnsService from "@/services/DfnsService";
import { ColumnConfig, EXCLUDED_COLUMNS } from "@/types/dynamicTableColumn";
import { hashToColor } from "@/utils/colorUtils";
import { formatPrice } from "@/utils/currencyFormater";

import { UserContext } from "../../context/UserContext";
import { WalletPreference } from "../../utils/constants";
import { GenerateSvgIcon } from "../atoms/TokenSVG";

const depositService = DepositService();

interface TokenListViewProps {
  tokens: any[];
  isSalesHistory: boolean; // New prop to determine if this is a sales history view
  industryTemplate?: string;
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
}

const TokenListView: React.FC<TokenListViewProps> = ({ tokens, isSalesHistory, industryTemplate, setRefresh }) => {
  const [filteredTokens, setFilteredTokens] = useState(tokens);
  const [filterQuery, setFilterQuery] = useState("");
  const blockchainService = BlockchainService.getInstance();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>(""); // State for the input value
  const [isSubmitting, setIsSubmitting] = useState(false); // For submission state
  const { walletPreference, dfnsToken, user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      await cleanupListedTokens();
    };

    fetchData();
  }, [tokens, blockchainService]);

  const cleanupListedTokens = async () => {
    try {
      const listedTokens = await blockchainService?.fetchItems();
      console.log("listedTokens: ", listedTokens);
      const listedTokensIds = new Set(listedTokens.map((token: any) => String(token["1"])));

      const updatedTokens = tokens.map((token) => ({
        ...token,
        token: {
          ...token.token,
          status: listedTokensIds.has(token.tokenId) ? "listed" : "unlisted",
        },
      }));

      console.log("updated tokens listed");

      setFilteredTokens(updatedTokens);
    } catch (error) {
      console.error("Error fetching listed tokens:", error);
    }
  };

  const pollTokenStatusUpdate = async (tokenId: number, expectedStatus: "listed" | "unlisted", retries = 10, delay = 3000): Promise<boolean> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      console.log(`🔄 Polling attempt ${attempt + 1}/${retries} for token ${tokenId}`);

      try {
        // Fetch fresh data directly from blockchain
        const listedTokens = await blockchainService?.fetchItems();

        if (!listedTokens) {
          console.error("Failed to fetch items from blockchain");
          continue; // Try again on next iteration
        }

        const listedTokensIds = new Set(listedTokens.map((token: any) => String(token["1"])));

        // Determine current status based on blockchain data
        const isListed = listedTokensIds.has(String(tokenId));
        const currentStatus = isListed ? "listed" : "unlisted";

        console.log(`Token ${tokenId} current status: ${currentStatus}, expected: ${expectedStatus}`);

        if (currentStatus === expectedStatus) {
          console.log(`✅ Token ${tokenId} is now ${expectedStatus}`);

          // Update local state to match blockchain state
          setFilteredTokens((prevTokens) =>
            prevTokens.map((token) => (token.tokenId === tokenId ? { ...token, token: { ...token.token, status: expectedStatus } } : token))
          );

          return true; // Successfully validated status change
        }
      } catch (error) {
        // Log error but don't fail the polling yet, try again
        console.error(`Error during polling attempt ${attempt + 1}:`, error);

        // If this is the last attempt, return false to indicate failure
        if (attempt === retries - 1) {
          return false;
        }
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // We've timed out without seeing the status change
    console.warn(`⚠️ Polling timed out. Token ${tokenId} status update not detected.`);
    return false;
  };

  // Helper function to validate blockchain transaction responses
  const validateBlockchainResponse = (response: any): boolean => {
    if (!response) return false;

    // Example: Check if response contains an error property
    if (response.error) return false;

    // Example: Check for transaction hash or other success indicators
    if (response.transactionHash || response.txHash || response.success) return true;

    // If no clear indicators, assume success (can be adjusted based on your needs)
    return true;
  };

  const formatColumnTitle = (title: string): string => {
    return typeof title === "string"
      ? title
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
          .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize each word
      : title;
  };

  const handleStatusChange = async (tokenId: number, checked: boolean) => {
    if (!blockchainService) {
      toast.error("Blockchain service is not available.");
      return;
    }

    // Create a toastId first to track this operation
    const toastId = toast.loading(checked ? "Listing token on the marketplace..." : "Delisting token...");

    try {
      const walletId = user?.walletId || null;
      const safeDfnsToken = dfnsToken || "";

      if (walletPreference === WalletPreference.MANAGED && (!walletId || !safeDfnsToken)) {
        toast.update(toastId, {
          render: "Missing wallet credentials for DFNS transactions.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }

      // Fetch token details
      const token = filteredTokens.find((t) => t.tokenId === tokenId);
      if (!token) {
        toast.update(toastId, {
          render: "Token not found.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }

      let txResponse = null;

      try {
        if (checked) {
          const existingCredits = Number(token.token.existingCredits);
          const safeExistingCredits = isNaN(existingCredits) ? 1 : existingCredits; // Default to 1 if NaN
          const price = Number(token.token.price);

          console.log("Listing:", {
            tokenId,
            existingCredits,
            safeExistingCredits, // Log the safe value too
            price,
            isExistingCreditsValid: !isNaN(existingCredits),
            isPriceValid: !isNaN(price),
            calculatedTotal: safeExistingCredits * price,
          });

          // LIST ITEM
          if (walletPreference === WalletPreference.PRIVATE) {
            // Calculate price safely with validations
            const totalPrice = (safeExistingCredits * price).toFixed(6); // Ensure 6 decimal places for USDC
            console.log("Calculated totalPrice for listing:", totalPrice);

            // Check if totalPrice is valid before proceeding
            if (isNaN(parseFloat(totalPrice))) {
              throw new Error("Calculated price is not a valid number");
            }

            const usdcPrice = ethers.parseUnits(totalPrice, 6);
            txResponse = await blockchainService?.listItem(token.receiver, tokenId, usdcPrice, true);
          } else {
            // Calculate price safely with validations for DFNS
            const totalPrice = (safeExistingCredits * price).toFixed(6); // Ensure 6 decimal places for USDC
            console.log("Calculated totalPrice for DFNS listing:", totalPrice);

            // Check if totalPrice is valid before proceeding
            if (isNaN(parseFloat(totalPrice))) {
              throw new Error("Calculated price is not a valid number");
            }

            txResponse = await DfnsService.dfnsListItem(walletId, safeDfnsToken, token.receiver, tokenId, totalPrice, true);
          }
        } else {
          // DELIST ITEM
          if (walletPreference === WalletPreference.PRIVATE) {
            txResponse = await blockchainService?.delistItem(tokenId);

            // Check transaction response
            if (!validateBlockchainResponse(txResponse)) {
              throw new Error("Blockchain transaction failed or returned invalid response");
            }
          } else {
            txResponse = await DfnsService.dfnsDelistItem(walletId, safeDfnsToken, tokenId);

            // Check DFNS response
            if (txResponse?.error) {
              throw new Error(`DFNS error: ${txResponse.error}`);
            }
          }
        }

        console.log(`Transaction response for ${checked ? "listing" : "delisting"} token ${tokenId}:`, txResponse);

        // Update toast to "Verifying transaction..."
        toast.update(toastId, {
          render: "Verifying transaction status...",
          type: "info",
          isLoading: true,
        });

        // Poll for status change with timeout
        const pollingSuccess = await pollTokenStatusUpdate(tokenId, checked ? "listed" : "unlisted");

        if (pollingSuccess) {
          // Success case - status changed as expected
          toast.update(toastId, {
            render: checked ? "✅ Token listed successfully!" : "✅ Token delisted successfully!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          // Warning case - transaction sent but status didn't update in time
          toast.update(toastId, {
            render: checked
              ? "⚠️ Transaction sent but status change not confirmed. Please refresh later."
              : "⚠️ Transaction sent but status change not confirmed. Please refresh later.",
            type: "warning",
            isLoading: false,
            autoClose: 7000,
          });
        }
      } catch (error) {
        // Handle transaction error - log full error details first
        console.error("Transaction error details:", error);

        // Extract error message for toast
        let errorMessage = "Operation failed.";
        if (error instanceof Error) errorMessage = error.message;
        if (typeof error === "string") errorMessage = error;

        // Check for specific error patterns from blockchain/DFNS
        if (txResponse?.error) {
          errorMessage = `${txResponse.error}`;
        }

        toast.update(toastId, {
          render: checked ? `❌ Failed to list token: ${errorMessage}` : `❌ Failed to delist token: ${errorMessage}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (e) {
      // Outer catch block for any other errors - log full details first
      console.error("Token status update error (full details):", e);

      let errorMessage = "Failed to update token status.";
      if (e instanceof Error) errorMessage = e.message;
      if (typeof e === "string") errorMessage = e;

      toast.update(toastId, {
        render: `❌ Error: ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

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

  const pollDepositUpdate = async (tokenId: string, addedAmount: number, retries = 5, delay = 2000) => {
    let result = await depositService.getTotalDepositAmountAndTokenPrice(tokenId);
    let initialDepositAmount = result?.totalAmount / 1_000_000 || 0;
    let expectedDepositAmount = initialDepositAmount + addedAmount; // 🔹 What we expect after the deposit

    console.log(`🔍 Initial deposit: ${initialDepositAmount} USDC`);
    console.log(`📝 Expecting final deposit: ${expectedDepositAmount} USDC`);

    for (let attempt = 0; attempt < retries; attempt++) {
      console.log(`🔄 Polling deposit amount... Attempt ${attempt + 1}/${retries}`);

      let latestResult = await depositService.getTotalDepositAmountAndTokenPrice(tokenId);
      let updatedDepositAmount = latestResult?.totalAmount / 1_000_000 || 0;

      console.log(`📡 API Response: ${updatedDepositAmount} USDC`);

      // ✅ Stop polling if the expected deposit amount is reached
      if (updatedDepositAmount >= expectedDepositAmount) {
        console.log(`✅ Deposit updated successfully: ${updatedDepositAmount} USDC`);
        setFilteredTokens((prevTokens) =>
          prevTokens.map((token) =>
            token.tokenId === tokenId ? { ...token, token: { ...token.token, depositAmount: updatedDepositAmount } } : token
          )
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.warn(`⚠️ Deposit polling timed out. Expected: ${expectedDepositAmount}`);
  };

  const handleDepositSubmit = async () => {
    let result = await depositService.getTotalDepositAmountAndTokenPrice(selectedTokenId || "0");
    let totalDepositAmount = result?.totalAmount / 1_000_000 || 0;
    totalDepositAmount += Number(amount);

    if (result?.price < totalDepositAmount) {
      toast.warning("The total deposited amount exceeds the token price.");
      return;
    }

    console.log(`Token ID: ${selectedTokenId}, Amount: ${amount}`);
    setIsSubmitting(true);

    let toastId;

    try {
      if (!selectedTokenId || !amount) {
        throw new Error("Missing required deposit details.");
      }

      const walletId = user?.walletId || null;
      const safeDfnsToken = dfnsToken || "";

      if (walletPreference === WalletPreference.MANAGED && (!walletId || !safeDfnsToken)) {
        throw new Error("Missing wallet credentials for DFNS transactions.");
      }

      // **Convert amount to valid BigNumber format (USDC has 6 decimals)**
      // **Convert amount based on wallet type**
      const depositAmount = walletPreference === WalletPreference.PRIVATE ? amount.toString() : ethers.parseUnits(amount.toString(), 6).toString();

      if (!depositAmount) {
        throw new Error("Deposit amount is invalid.");
      }

      // **Step 1: Start Approval Toast**
      toastId = toast.loading("Approving USDC for deposit...");

      if (walletPreference === WalletPreference.MANAGED) {
        // **Managed Wallets: Approve USDC before deposit**
        const approvalResponse = await DfnsService.dfnsApproveUSDC(walletId, safeDfnsToken, depositAmount);

        if (approvalResponse.error) {
          throw new Error(`USDC approval failed: ${approvalResponse.error}`);
        }
      }

      // **Step 2: Update toast for Approval Success & Wait**
      toast.update(toastId, {
        render: "✅ USDC Approved! Proceeding with deposit...",
        type: "success",
        isLoading: false,
        autoClose: 2000, // Show success for 2 seconds
      });

      // **Introduce a small delay before proceeding to deposit**
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // **Step 3: Start Deposit Toast**
      toastId = toast.loading("Processing deposit...");

      if (walletPreference === WalletPreference.PRIVATE) {
        await depositService.deposit(selectedTokenId, depositAmount);
      } else {
        await DfnsService.dfnsDeposit(walletId, safeDfnsToken, [
          {
            tokenId: selectedTokenId,
            amount: depositAmount,
          },
        ]);
      }

      // **Step 4: Final Success Toast**
      toast.update(toastId, {
        render: `✅ Deposit successfully made for Token ID ${selectedTokenId}`,
        type: "success",
        isLoading: false,
        autoClose: 5000, // Keep toast open for 5 seconds
      });

      await pollDepositUpdate(selectedTokenId, Number(amount));
      setRefresh?.((prev) => !prev);

      // Reset form state
      setIsModalVisible(false);
      setAmount("");
      setIsSubmitting(false);
    } catch (e) {
      let errorMessage = "❌ Failed to deposit.";

      if (e instanceof Error) {
        errorMessage = `❌ ${e.message}`;
      } else if (typeof e === "string") {
        errorMessage = `❌ ${e}`;
      }

      console.error("Deposit Error:", e);

      // **Check if toastId exists before updating**
      if (toastId) {
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 6000, // Show error for 6 seconds
        });
      } else {
        // **If toast didn't start, create a new error toast**
        toast.error(errorMessage, { autoClose: 6000 });
      }

      setIsSubmitting(false);
    }
  };

  const getDynamicColumns = (maxColumns = 16): ColumnConfig[] => {
    const nonNullColumns: Record<string, ColumnConfig> = {};

    tokens.forEach((token) => {
      const tokenData = industryTemplate === Industries.TRADE_FINANCE ? token : token.token;

      // Skip tokens with invalid data
      if (!token || !tokenData || typeof tokenData !== "object") {
        console.warn("Skipping token with missing or invalid data:", token);
        return; // Skip this iteration
      }

      try {
        Object.entries(tokenData).forEach(([key, value]) => {
          // Skip depositAmount column for trade finance projects
          if (industryTemplate === Industries.TRADE_FINANCE && key === "depositAmount") {
            return;
          }
          // Check if the column is non-null, non-undefined, not already in nonNullColumns, and not excluded
          if (value != null && !(key in nonNullColumns) && !EXCLUDED_COLUMNS.has(key)) {
            nonNullColumns[key] = {
              title: formatColumnTitle(key), // Use the formatting function here
              key,
            };
          }
        });
      } catch (error) {
        console.error("Error processing token for dynamic columns:", token, error);
      }
    });

    return Object.values(nonNullColumns).slice(0, maxColumns);
  };

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const createColumns = (nonNullColumns: ColumnConfig[]) => {
    return nonNullColumns.map(({ title, key }) => ({
      title: key === "totalAmount" ? "Price" : title, // 🟢 Override display title
      dataIndex: industryTemplate === Industries.TRADE_FINANCE ? key : ["token", key],
      render: (value: any) => {
        if (key === "totalAmount") {
          return formatPrice(value / 1_000_000, "USD"); // 🟢 Format for USDC
        }

        if (typeof value === "object") return "N/A";
        if (typeof value === "string" && isValidUrl(value)) {
          return (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
              View Document
            </a>
          );
        }

        return <span>{value}</span>;
      },
      sorter: (a: any, b: any) => {
        const aValue = industryTemplate === Industries.TRADE_FINANCE ? a[key] : a.token[key];
        const bValue = industryTemplate === Industries.TRADE_FINANCE ? b[key] : b.token[key];
        return typeof aValue === "number" && typeof bValue === "number" ? aValue - bValue : 0;
      },
    }));
  };

  const dynamicColumns = getDynamicColumns(); // This would be your method to get the first 7 non-null columns
  const additionalColumns = createColumns(dynamicColumns);

  // Define columns conditionally based on `isSalesHistory`
  const listingColumns = [
    // {
    //   title: "",
    //   dataIndex: "tokenId",
    //   render: (tokenId: string) => <Eye className="cursor-pointer" onClick={() => handleDepositClick(tokenId)} />,
    // },
    {
      title: () => <th style={{ width: "20%" }}>Title</th>,
      dataIndex: "tokenId",
      render: (tokenId: string, record: any) => {
        const color = hashToColor(tokenId);
        const title = industryTemplate === Industries.TRADE_FINANCE ? record.nftTitle : record.token?.nftTitle;
        const description = industryTemplate === Industries.TRADE_FINANCE ? record.description : record.token?.description;
        return (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="w-6 h-6">
                <span></span>
                <GenerateSvgIcon color={color} />
              </div>
              <span style={{ marginLeft: "10px", fontWeight: "bold" }}>{title}</span>{" "}
            </div>
            <p className="text-xs !text-gray-500">
              {description || "This is a placeholder description for the token. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>
          </>
        );
      },
      sorter: (a: any, b: any) => {
        const aTitle = industryTemplate === Industries.TRADE_FINANCE ? a.nftTitle : a.token?.nftTitle;
        const bTitle = industryTemplate === Industries.TRADE_FINANCE ? b.nftTitle : b.token?.nftTitle;
        return (aTitle || "").localeCompare(bTitle || "");
      },
    },
    // {
    //   title: "Description",
    //   dataIndex: "token",
    //   render: (token: any) => (
    //     <p className="text-sm text-gray-600 mt-1 line-clamp-1">
    //       {token.description ||
    //         "This is a placeholder description for the token. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
    //     </p>
    //   ),
    // },
    ...(filteredTokens.some((row: any) => row.price > 0)
      ? [
          {
            title: "Price",
            dataIndex: "price",
            render: (price: number) => (isSalesHistory ? formatPrice(price, "USD") : formatPrice(price / 1_000_000, "USD")),
            sorter: (a: any, b: any) => a.price - b.price,
          },
        ]
      : []),
    ...additionalColumns,
    // Conditionally add the "Status" column only if `isSalesHistory` is false
    ...(isSalesHistory
      ? [
          ...(industryTemplate && industryTemplate === Industries.TOKENIZED_DEBT
            ? [
                {
                  title: "Deposit",
                  dataIndex: "tokenId",
                  render: (tokenId: string) => <MoneyRecive className="cursor-pointer float-right" onClick={() => handleDepositClick(tokenId)} />,
                },
                {
                  title: "Deposited Amount",
                  dataIndex: "depositAmount",
                  render: (depositAmount: number) => <span>{formatPrice(depositAmount / 1_000_000, "USD")}</span>,
                },
              ]
            : []),
        ]
      : [
          ...(industryTemplate && industryTemplate === Industries.TOKENIZED_DEBT
            ? [
                {
                  title: "Deposit",
                  dataIndex: "tokenId",
                  render: (tokenId: string) => <MoneyRecive className="cursor-pointer float-right" onClick={() => handleDepositClick(tokenId)} />,
                },
                {
                  title: "Deposited Amount",
                  dataIndex: "depositAmount",
                  render: (depositAmount: number) => <span>{formatPrice(depositAmount / 1_000_000, "USD")}</span>,
                },
              ]
            : []),
          ...(industryTemplate !== Industries.TRADE_FINANCE
            ? [
                {
                  title: "Status",
                  dataIndex: ["token", "status"],
                  render: (status: string, record: any) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "160px",
                      }}
                    >
                      <span
                        className={`py-1 px-2 mr-10 w-20 text-center rounded border ${
                          status === "listed"
                            ? "border-nomyx-success-light text-nomyx-success-light bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
                            : "border-nomyx-danger-light text-nomyx-danger-light bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark"
                        }`}
                      >
                        {status}
                      </span>
                      <Switch
                        className="status-toggle-switch"
                        checked={status === "listed"}
                        onChange={(checked) => handleStatusChange(record.tokenId, checked)}
                      />
                    </div>
                  ),
                  sorter: (a: any, b: any) => a.token.status.localeCompare(b.token.status),
                },
              ]
            : []),
        ]),
  ];

  return (
    <>
      <Table
        columns={listingColumns}
        dataSource={filteredTokens}
        rowKey="tokenId"
        pagination={false}
        scroll={{ x: "100%" }}
        style={{
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          maxHeight: "350px",
          overflowY: "auto",
        }}
      />
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
    </>
  );
};

export default TokenListView;
