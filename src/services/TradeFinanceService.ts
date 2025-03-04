import Parse from "parse";

import BlockchainService from "./BlockchainService";
import ParseClient from "./ParseClient";

export const TradeFinanceService = () => {
  const blockchainService = BlockchainService.getInstance();
  ParseClient.initialize();

  const getTradeFiPools = async () => {
    try {
      let records = await ParseClient.getRecords("TradeFiPool", [], [], ["*"], undefined, undefined, undefined, "desc");
      return records;
    } catch (error) {
      console.error("Error fetching TradeFi pools:", error);
      return [];
    }
  };

  const getTradeFiPoolDetails = async (id: string) => {
    try {
      let record = await ParseClient.get("TradeFiPool", id);
      return JSON.parse(JSON.stringify(record));
    } catch (error) {
      console.error("Error fetching TradeFi pool details:", error);
      return null;
    }
  };

  const createTradeFiPool = async (poolData: {
    title: string;
    description: string;
    logo: string;
    coverImage: string;
    creditType: string;
    maturityDate: Date;
  }) => {
    try {
      const [logoFile, coverImageFile] = await Promise.all([
        ParseClient.saveFile("pool-logo", { base64: poolData.logo }),
        ParseClient.saveFile("pool-cover", { base64: poolData.coverImage }),
      ]);

      const { logo, coverImage, ...updatedPoolData } = poolData;

      // Create the pool with initial values
      const pool = await ParseClient.createRecord("TradeFiPool", [], [], {
        ...updatedPoolData,
        logo: logoFile,
        coverImage: coverImageFile,
        totalUsdcDeposited: 0,
        totalInvoiceAmount: 0,
        totalInvoices: 0,
        usdcRemaining: 0,
      });

      return pool;
    } catch (error) {
      console.error("Error creating TradeFi pool:", error);
      throw error;
    }
  };

  return {
    getTradeFiPools,
    getTradeFiPoolDetails,
    createTradeFiPool,
  };
};
