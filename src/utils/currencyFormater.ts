import { ethers } from "ethers";

export const formatPrice = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatUSDC = (value: string | number): number => {
  try {
    return Number(ethers.formatUnits(value.toString(), 6));
  } catch (error) {
    console.error("Error formatting USDC value:", error);
    return 0;
  }
};
export function formatNumber(value: any) {
  const userLocale = navigator.language || "en-US";
  const formatter = new Intl.NumberFormat(userLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}
