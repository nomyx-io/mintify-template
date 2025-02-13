import Parse from "parse";

import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

export const DepositService = () => {
  const blockchainService = BlockchainService.getInstance();
  ParseClient.initialize();

  const deposit = async (tokenId: any, amount: any) => {
    const depositData = [
      {
        tokenId,
        amount: amount || "0",
      },
    ];
    await blockchainService?.deposit(depositData);
  };

  const getTotalDepositAmountAndTokenPrice = async (tokenId: string) => {
    try {
      // Query Token class to find the token object with the given tokenId
      const tokenQuery = new Parse.Query("Token");
      tokenQuery.equalTo("tokenId", tokenId);
      const tokenObject = await tokenQuery.first(); // Fetch full object

      if (!tokenObject) {
        console.error("Token not found for the given tokenId:", tokenId);
        return { totalAmount: 0, price: 0 };
      }

      // Retrieve the price value safely
      const price = Number(tokenObject.get("price")) || 0;

      // Fetch all TokenDeposit records where 'token' column matches the full Token object
      const records = await ParseClient.getRecords(
        "TokenDeposit",
        ["token"], // Pointer field
        [tokenObject], // Full Token object
        [],
        1000,
        0,
        "createdAt",
        "desc"
      );

      if (!records || records.length === 0) {
        return { totalAmount: 0, price };
      }

      // Sum the 'amount' field from all retrieved TokenDeposit records
      const totalAmount = records.reduce((sum, record) => sum + (Number(record.get("amount")) || 0), 0);

      return { totalAmount, price };
    } catch (error) {
      console.error("Error fetching total deposit amount and price:", error);
      return { totalAmount: 0, price: 0 };
    }
  };

  return {
    deposit,
    getTotalDepositAmountAndTokenPrice,
  };
};
