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
