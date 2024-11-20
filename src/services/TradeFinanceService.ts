import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

export const TradeFinanceService = () => {
  const blockchainService = BlockchainService.getInstance();
  ParseClient.initialize();

  return {};
};
