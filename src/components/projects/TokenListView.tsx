import React, { useState, useEffect } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Table, Switch } from "antd";
import { hashToColor } from "@/utils/colorUtils";
import BlockchainService from "@/services/BlockchainService";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { formatPrice } from "@/utils/currencyFormater";
import { GenerateSvgIcon } from "../atoms/TokenSVG";
import { ColumnConfig, EXCLUDED_COLUMNS } from "@/types/dynamicTableColumn";

interface TokenListViewProps {
  tokens: any[];
  isSalesHistory: boolean; // New prop to determine if this is a sales history view
}

const TokenListView: React.FC<TokenListViewProps> = ({
  tokens,
  isSalesHistory,
}) => {
  const [filteredTokens, setFilteredTokens] = useState(tokens);
  const [filterQuery, setFilterQuery] = useState("");
  const blockchainService = BlockchainService.getInstance();

  useEffect(() => {
    const cleanupListedTokens = async () => {
      try {
        const listedTokens = await blockchainService?.fetchItems();
        const listedTokensIds = new Set(
          listedTokens.map((token: any) => String(token["1"]))
        );

        const updatedTokens = tokens.map((token) => ({
          ...token,
          token: {
            ...token.token,
            status: listedTokensIds.has(token.tokenId) ? "listed" : "unlisted",
          },
        }));

        setFilteredTokens(updatedTokens);
      } catch (error) {
        console.error("Error fetching listed tokens:", error);
      }
    };

    cleanupListedTokens();
  }, [tokens, blockchainService]);

  const handleStatusChange = async (tokenId: number, checked: boolean) => {
    if (!blockchainService) {
      toast.error("Blockchain service is not available.");
      return;
    }

    try {
      if (checked) {
        // Step 1: Start listing process with a loading toast
        const listingToast = toast.loading("Listing token...");

        // Get the project details to list
        const token = filteredTokens.find((t) => t.tokenId === tokenId);
        const totalPrice = (
          Number(token.token.existingCredits) * Number(token.token.price)
        ).toString();

        if (!totalPrice || !token) {
          throw new Error("Invalid price or token details.");
        }

        //format for usdc decimals
        const usdcPrice = ethers.parseUnits(totalPrice, 6);

        // Step 2: List the token using the blockchain service
        await blockchainService?.listItem(
          token.receiver,
          tokenId,
          usdcPrice,
          true // Transfer the NFT to the marketplace
        );

        // Step 3: Update the listing toast with success
        toast.update(listingToast, {
          render: `Token successfully listed with ID: ${tokenId}`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        // Step 1: Start delisting process with a loading toast
        const delistingToast = toast.loading("Delisting token...");

        // Step 2: Delist the token using the blockchain service
        await blockchainService?.delistItem(tokenId);

        // Step 3: Update the delisting toast with success
        toast.update(delistingToast, {
          render: `Token with ID ${tokenId} has been delisted.`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      }

      // Step 4: Update local state after success
      const listedTokens = await blockchainService?.fetchItems(); // Get all listed tokens
      const listedTokensIds = new Set(
        listedTokens.map((token: any) => String(token["1"]))
      );

      // Update the local state with the latest token status
      setFilteredTokens((prevTokens) =>
        prevTokens.map((token) => {
          const listedToken = listedTokensIds.has(token.tokenId);
          return {
            ...token,
            token: {
              ...token.token,
              status: listedToken ? "listed" : "unlisted",
            },
          };
        })
      );
    } catch (e) {
      // Step 5: Handle errors and show an error toast
      let errorMessage = "Failed to update token status.";
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }

      console.error(e);
      toast.error(errorMessage);
    }
  };

  const getDynamicColumns = (maxColumns = 7): ColumnConfig[] => {
    const nonNullColumns: Record<string, ColumnConfig> = {};
    tokens.forEach((token) => {
      Object.entries(token.token).forEach(([key, value]) => {
        // Check if the column is non-null, non-undefined, not already in nonNullColumns, and not excluded
        if (
          value != null &&
          !(key in nonNullColumns) &&
          !EXCLUDED_COLUMNS.has(key)
        ) {
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
      render: (value: any) =>
        typeof value === "object" ? "N/A" : <span>{value}</span>,
      sorter: (a: any, b: any) => {
        const aValue = a.token[key];
        const bValue = b.token[key];
        return typeof aValue === "string" && typeof bValue === "string"
          ? aValue.localeCompare(bValue)
          : 0;
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
              <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                {record.token?.nftTitle}
              </span>{" "}
            </div>
            <p className="text-xs !text-gray-500">
              {record.token?.description ||
                "This is a placeholder description for the token. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>
          </>
        );
      },
      sorter: (a: any, b: any) =>
        a.token.nftTitle.localeCompare(b.token.nftTitle),
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
      render: (price: number) =>
        isSalesHistory
          ? formatPrice(price, "USD")
          : formatPrice(price / 1_000_000, "USD"),
      sorter: (a: any, b: any) => a.price - b.price,
    },
    ...additionalColumns,
    // Conditionally add the "Status" column only if `isSalesHistory` is false
    ...(isSalesHistory
      ? []
      : [
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
                  onChange={(checked) =>
                    handleStatusChange(record.tokenId, checked)
                  }
                />
              </div>
            ),
            sorter: (a: any, b: any) =>
              a.token.status.localeCompare(b.token.status),
          },
        ]),
  ];

  return (
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
  );
};

export default TokenListView;
