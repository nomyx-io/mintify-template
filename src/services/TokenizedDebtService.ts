import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

export const TokenizedDebtService = () => {
  const blockchainService = BlockchainService.getInstance();
  ParseClient.initialize();

  return {};
};
