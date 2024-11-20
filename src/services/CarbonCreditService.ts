import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

export const CarbonCreditService = () => {
  const blockchainService = BlockchainService.getInstance();
  ParseClient.initialize();

  const initializeCarbonCredit = async (tokenId: any, existingCredits: any) => {
    await blockchainService?.initializeCarbonCredit(tokenId, existingCredits || "0");
  };

  return {
    initializeCarbonCredit,
  };
};
