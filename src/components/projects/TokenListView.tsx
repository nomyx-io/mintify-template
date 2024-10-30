import React, { useState, useEffect } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Table, Switch } from "antd";
import { hashToColor } from "@/utils/colorUtils";
import BlockchainService from "@/services/BlockchainService";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { formatPrice } from "@/utils/currencyFormater";

interface TokenListViewProps {
  tokens: any[];
  onProjectClick: (project: any) => void;
  isSalesHistory: boolean; // New prop to determine if this is a sales history view
}

const TokenListView: React.FC<TokenListViewProps> = ({
  tokens,
  onProjectClick,
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

  // Generate SVG Icon
  const generateSvgIcon = (color: string) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient
            id={`gradient-${color}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#003366" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect
          width="100"
          height="100"
          rx="15"
          fill={`url(#gradient-${color})`}
        />
        <text
          x="50%"
          y="50%"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="40"
          fill="white"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          KC
        </text>
      </svg>
    );
  };

  // Define columns conditionally based on `isSalesHistory`
  const listingColumns = [
    {
      title: "Title",
      dataIndex: "tokenId",
      render: (tokenId: string, record: any) => {
        const color = hashToColor(tokenId);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* {!isSalesHistory && (
            <EyeOutlined
              className="text-xl cursor-pointer hover:text-blue-500"
              onClick={() => onProjectClick(record)}
              style={{ marginRight: "8px" }}
            />
          )} */}
            {/* {!isSalesHistory && (
            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "#ccc",
                marginRight: "8px",
              }}
            />
          )} */}
            {generateSvgIcon(color)}
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {record.token?.nftTitle}
            </span>
          </div>
        );
      },
      sorter: (a: any, b: any) =>
        a.token.nftTitle.localeCompare(b.token.nftTitle),
    },
    {
      title: "Price Per Credit",
      dataIndex: ["token", "price"],
      render: (price: number) => `${formatPrice(price, "USD")}`,
      sorter: (a: any, b: any) => a.token.price - b.token.price,
    },
    {
      title: "Total Price",
      dataIndex: "price",
      render: (price: number) => 
        isSalesHistory ? formatPrice(price, "USD") : formatPrice(price / 1_000_000, "USD"),      
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: "Registry ID",
      dataIndex: ["token", "registerId"],
      render: (registerId: string) => <span>{registerId}</span>,
      sorter: (a: any, b: any) =>
        a.token.registerId.localeCompare(b.token.registerId),
    },
    {
      title: "Carbon Offset (Tons)",
      dataIndex: ["token", "existingCredits"],
      render: (existingCredits: number) => Intl.NumberFormat("en-US").format(existingCredits),
      sorter: (a: any, b: any) =>
        a.token.existingCredits - b.token.existingCredits,
    },
    {
      title: "Issuance Date",
      dataIndex: ["token", "issuanceDate"],
      render: (issuanceDate: string) => <span>{issuanceDate}</span>,
      sorter: (a: any, b: any) =>
        a.token.issuanceDate.localeCompare(b.token.issuanceDate),
    },
    {
      title: "GHG Reduction Type",
      dataIndex: ["token", "ghgReduction"],
      render: (ghgReduction: string) => <span>{ghgReduction}</span>,
      sorter: (a: any, b: any) =>
        a.token.ghgReduction.localeCompare(b.token.ghgReduction),
    },
    {
      title: "Geography",
      dataIndex: ["token", "country"],
      // render: (country: string, state: string) => <span>{country && state ? `${country}, ${state.}` : country || state}</span>,
      render: (country: string) => <span>{country}</span>,
      // compare country and state
      sorter: (a: any, b: any) =>
        a.token.country === b.token.country
          ? a.token.state.localeCompare(b.token.state)
          : a.token.country.localeCompare(b.token.country),
    },
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
