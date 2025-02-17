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

  return {
    deposit,
  };
};
