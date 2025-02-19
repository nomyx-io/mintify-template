import React, { useState, useEffect, useContext } from "react";

import { EyeOutlined } from "@ant-design/icons";
import { Table, Switch, Modal, Input, Button } from "antd";
import { ethers } from "ethers";
import { MoneyRecive } from "iconsax-react";
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
}

const TokenListView: React.FC<TokenListViewProps> = ({ tokens, isSalesHistory, industryTemplate }) => {
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

  const pollTokenStatusUpdate = async (tokenId: number, expectedStatus: "listed" | "unlisted", retries = 10, delay = 3000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      console.log(`🔄 Polling attempt ${attempt + 1}/${retries} for token ${tokenId}`);

      await cleanupListedTokens();

      // Get the updated token status
      const token = filteredTokens.find((t) => t.tokenId === tokenId);
      if (token && token.token.status === expectedStatus) {
        console.log(`✅ Token ${tokenId} is now ${expectedStatus}`);
        return; // Stop polling once status is updated
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.warn(`⚠️ Polling timed out. Token ${tokenId} status update not detected.`);
  };

  const handleStatusChange = async (tokenId: number, checked: boolean) => {
    if (!blockchainService) {
      toast.error("Blockchain service is not available.");
      return;
    }

    try {
      const walletId = user?.walletId || null;
      const safeDfnsToken = dfnsToken || "";

      if (walletPreference === WalletPreference.MANAGED && (!walletId || !safeDfnsToken)) {
        throw new Error("Missing wallet credentials for DFNS transactions.");
      }

      // Fetch token details
      const token = filteredTokens.find((t) => t.tokenId === tokenId);
      if (!token) throw new Error("Token not found.");

      const processTransaction = async () => {
        if (checked) {
          // **LIST ITEM**
          if (walletPreference === WalletPreference.PRIVATE) {
            const totalPrice = (Number(token.token.existingCredits) * Number(token.token.price)).toString();
            const usdcPrice = ethers.parseUnits(totalPrice, 6);
            await blockchainService?.listItem(token.receiver, tokenId, usdcPrice, true);
          } else {
            const totalPrice = (Number(token.token.existingCredits) * Number(token.token.price)).toString();
            await DfnsService.dfnsListItem(walletId, safeDfnsToken, token.receiver, tokenId, totalPrice, true);
          }
        } else {
          // **DELIST ITEM**
          if (walletPreference === WalletPreference.PRIVATE) {
            await blockchainService?.delistItem(tokenId);
          } else {
            await DfnsService.dfnsDelistItem(walletId, safeDfnsToken, tokenId);
          }
        }

        // **Polling to check for status update**
        await pollTokenStatusUpdate(tokenId, checked ? "listed" : "unlisted");
      };

      await toast.promise(
        processTransaction(),
        {
          pending: checked ? "Listing token on the marketplace..." : "Delisting token...",
          success: checked ? `✅ Token listed successfully!` : `✅ Token delisted successfully!`,
          error: checked ? "❌ Failed to list token." : "❌ Failed to delist token.",
        },
        { autoClose: 5000 }
      );
    } catch (e) {
      let errorMessage = "Failed to update token status.";
      if (e instanceof Error) errorMessage = e.message;
      if (typeof e === "string") errorMessage = e;

      console.error(e);
      toast.error(errorMessage);
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
  const handleSubmit = async () => {
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
      const depositAmount = ethers.parseUnits(amount.toString(), 6).toString();

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

  const getDynamicColumns = (maxColumns = 7): ColumnConfig[] => {
    const nonNullColumns: Record<string, ColumnConfig> = {};
    tokens.forEach((token) => {
      Object.entries(token.token).forEach(([key, value]) => {
        // Check if the column is non-null, non-undefined, not already in nonNullColumns, and not excluded
        if (value != null && !(key in nonNullColumns) && !EXCLUDED_COLUMNS.has(key)) {
          nonNullColumns[key] = {
            title: key
              .replace(/([A-Z])/g, " $1") // Add a space before uppercase letters
              .replace(/^./, (str) => str.toUpperCase()), // Capitalize the first letter
            key,
          };
        }
      });
    });
    return Object.values(nonNullColumns).slice(0, maxColumns);
  };

  const createColumns = (nonNullColumns: ColumnConfig[]) => {
    return nonNullColumns.map(({ title, key }) => ({
      title,
      dataIndex: ["token", key] as [string, string],
      render: (value: any) => (typeof value === "object" ? "N/A" : <span>{value}</span>),
      sorter: (a: any, b: any) => {
        const aValue = a.token[key];
        const bValue = b.token[key];
        return typeof aValue === "string" && typeof bValue === "string" ? aValue.localeCompare(bValue) : 0;
      },
    }));
  };

  const dynamicColumns = getDynamicColumns(); // This would be your method to get the first 7 non-null columns
  const additionalColumns = createColumns(dynamicColumns);

  // Define columns conditionally based on `isSalesHistory`
  const listingColumns = [
    {
      title: () => <th style={{ width: "20%" }}>Title</th>,
      dataIndex: "tokenId",
      render: (tokenId: string, record: any) => {
        const color = hashToColor(tokenId);
        return (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="w-6 h-6">
                <GenerateSvgIcon color={color} />
              </div>
              <span style={{ marginLeft: "10px", fontWeight: "bold" }}>{record.token?.nftTitle}</span>{" "}
            </div>
            <p className="text-xs !text-gray-500">
              {record.token?.description ||
                "This is a placeholder description for the token. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>
          </>
        );
      },
      sorter: (a: any, b: any) => a.token.nftTitle.localeCompare(b.token.nftTitle),
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
    {
      title: "Price",
      dataIndex: "price",
      render: (price: number) => (isSalesHistory ? formatPrice(price, "USD") : formatPrice(price / 1_000_000, "USD")),
      sorter: (a: any, b: any) => a.price - b.price,
    },
    ...additionalColumns,
    // Conditionally add the "Status" column only if `isSalesHistory` is false
    ...(isSalesHistory
      ? []
      : [
          ...(industryTemplate && industryTemplate === Industries.TOKENIZED_DEBT
            ? [
                {
                  title: "Deposit",
                  dataIndex: "tokenId",
                  render: (tokenId: string) => <MoneyRecive className="cursor-pointer" onClick={() => handleDepositClick(tokenId)} />,
                },
              ]
            : []),
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
            onClick={handleSubmit}
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
