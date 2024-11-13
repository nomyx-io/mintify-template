import React from "react";
import { Card } from "antd";
import { hashToColor } from "@/utils/colorUtils";
import { formatPrice } from "@/utils/currencyFormater";
import { GenerateSvgIcon } from "../atoms/TokenSVG";

interface TokenCardViewProps {
  tokens: any[];
  isSalesHistory: boolean; // New prop to determine if this is a sales history view
}

const TokenCardView: React.FC<TokenCardViewProps> = ({
  tokens,
  isSalesHistory,
}) => {

  return (
    <div className="grid gap-5 grid-cols-2 xl:grid-cols-3 mt-5 p-5">
      {tokens.map((token) => {
        const tokenId = token.tokenId ?? "default";
        const color = hashToColor(tokenId);

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

              {/* token Details Section */}
              <div className="mt-4 grid gap-2">
                {[
                  {
                    label: "Total Price",
                    value: isSalesHistory
                      ? formatPrice(token.price, "USD")
                      : formatPrice(token.price / 1_000_000, "USD"),
                  },
                  {
                    label: "Issuance Date",
                    value: token.token?.issuanceDate || "-",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    {/* Label on the left */}
                    <span className="font-semibold flex-1">{item.label}</span>

                    {/* Value on the right with consistent width */}
                    <span className="bg-gray-100 dark:bg-nomyx-dark1-dark p-2 rounded text-right w-2/3">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TokenCardView;
