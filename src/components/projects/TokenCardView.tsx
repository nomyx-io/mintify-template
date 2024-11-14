import React from "react";
import { Card } from "antd";
import { hashToColor } from "@/utils/colorUtils";
import { formatPrice } from "@/utils/currencyFormater";
import { GenerateSvgIcon } from "../atoms/TokenSVG";
import { ColumnConfig, EXCLUDED_COLUMNS, ColumnData } from "@/types/dynamicTableColumn";

interface TokenCardViewProps {
  tokens: any[];
  isSalesHistory: boolean;
}

const TokenCardView: React.FC<TokenCardViewProps> = ({
  tokens,
  isSalesHistory,
}) => {
  const getDynamicColumns = (maxColumns = 5): ColumnConfig[] => {
    const nonNullColumns: Record<string, ColumnConfig> = {};
    tokens.forEach((token) => {
      Object.entries(token.token).forEach(([key, value]) => {
        if (
          value != null &&
          !(key in nonNullColumns) &&
          !EXCLUDED_COLUMNS.has(key)
        ) {
          nonNullColumns[key] = {
            title: key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase()),
            key,
          };
        }
      });
    });
    return Object.values(nonNullColumns).slice(0, maxColumns);
  };

  const dynamicColumns = getDynamicColumns();

  return (
    <div className="grid gap-5 grid-cols-2 xl:grid-cols-3 mt-5 p-5">
      {tokens.length === 0 ? (
        <div className="col-span-2 xl:col-span-3 text-center p-10 bg-gray-100 rounded-lg text-black text-lg">
          No data
        </div>
      ) : (
        tokens.map((token) => {
          const tokenId = token.tokenId ?? "default";
          const color = hashToColor(tokenId);

          // Create column data for each token
          const dynamicColumnData: ColumnData[] = dynamicColumns.map(
            (column) => ({
              label: column.title,
              value: token.token?.[column.key] || "-",
            })
          );

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
                transform: !isSalesHistory
                  ? "translateY(0)"
                  : "translateY(-10px)",
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
                <h2 className="text-lg font-bold">
                  {token.token?.nftTitle || "Token Title"}
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {token.token?.description ||
                    "This is a placeholder description for the token. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                </p>

                {/* Token Details Section */}
                <div className="mt-4 grid gap-2">
                  {[
                    {
                      label: "Total Price",
                      value: isSalesHistory
                        ? formatPrice(token.price, "USD")
                        : formatPrice(token.price / 1_000_000, "USD"),
                    },
                    ...dynamicColumnData,
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="font-semibold text-left">
                        {item.label}
                      </span>
                      <span className="bg-gray-100 dark:bg-nomyx-dark1-dark p-2 rounded text-right w-2/3">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TokenCardView;
