import { ethers } from "ethers";
import moment from "moment";
import Parse from "parse";

import { Industries } from "@/constants/constants";
import { formatPrice } from "@/utils/currencyFormater";

import ParseClient from "./ParseClient";

const formatUSDC = (value: string | number): number => {
  try {
    return Number(ethers.formatUnits(value.toString(), 6));
  } catch (error) {
    console.error("Error formatting USDC value:", error);
    return 0;
  }
};

export const CustomerService = () => {
  ParseClient.initialize();

  const getEvents = async () => {
    try {
      let records = await ParseClient.getRecords("Event", [], [], ["*"]);
      let dateWiseData: {
        [key: string]: { data: { name: string; value: number }[] };
      } = {};
      const todayEvents = [];

      records &&
        records.forEach((entry) => {
          let record = entry.attributes;

          const eventDate =
            record.updatedAt.toISOString().split("T")[0] == moment().format("yyyy-MM-DD") ? "Today" : record.updatedAt.toISOString().split("T")[0];

          const eventData = {
            name: record?.event,
            // description: "description",
            value: 1,
          };

          if (!dateWiseData[eventDate]) {
            dateWiseData[eventDate] = { data: [eventData] };
          } else {
            const existingEvent = dateWiseData[eventDate].data.find((e) => e.name === eventData.name);
            if (existingEvent) {
              existingEvent.value++;
            } else {
              dateWiseData[eventDate].data.push(eventData);
            }
          }
          if (eventDate === "Today") {
            todayEvents.push(eventData);
          }
        });
      if (dateWiseData.hasOwnProperty("Today")) {
        const todayData = dateWiseData.Today;
        delete dateWiseData.Today;
        dateWiseData = { Today: todayData, ...dateWiseData };
      }
      // Sort events by date in descending order
      const sortedDateWiseData = Object.fromEntries(Object.entries(dateWiseData).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()));
      return sortedDateWiseData;
    } catch (error) {
      console.log(error);
    }
  };
  const getMintedNfts = async () => {
    let records = await ParseClient.getRecords("Token", undefined, undefined, ["*"]);
    return records;
  };
  const getMintedNftDetails = async (id: string) => {
    let records = await ParseClient.get("Token", id);
    return JSON.parse(JSON.stringify(records));
  };

  const getListings = async (fieldNames: string[], fieldValues: any[]) => {
    const records = await ParseClient.getRecords("TokenListing", fieldNames, fieldValues, ["*"], undefined, undefined, undefined, "desc");
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    return sanitizedRecords;
  };

  const getProjectTokens = async (fieldNames: string[], fieldValues: any[]) => {
    try {
      // Retrieve tokens from the Token class
      const tradeFinanceTokens = await ParseClient.getRecords("Token", fieldNames, fieldValues, ["*"], undefined, undefined, undefined, "desc");

      if (!tradeFinanceTokens || tradeFinanceTokens.length === 0) {
        return [];
      }

      // Extract token objectIds
      const tokenObjectIds = tradeFinanceTokens.map((token) => token.id);

      if (tokenObjectIds.length === 0) {
        return tradeFinanceTokens.map((record) => ({ ...record, depositAmount: 0 }));
      }

      // Query TokenDeposit for all tokens at once
      const depositQuery = new Parse.Query("TokenDeposit");
      depositQuery.containedIn(
        "token",
        tokenObjectIds.map((id) => new Parse.Object("Token", { id }))
      ); // Use pointers
      const depositRecords = await depositQuery.find();

      // Create a map of deposit amounts
      const depositMap: Record<string, number> = {};

      depositRecords.forEach((deposit) => {
        const tokenId = deposit.get("token").get("tokenId");
        const amount = Number(deposit.get("amount")) || 0;
        depositMap[tokenId] = (depositMap[tokenId] || 0) + amount;
      });

      let sanitizedRecords = [];
      if (tradeFinanceTokens && tradeFinanceTokens.length > 0) {
        sanitizedRecords = JSON.parse(JSON.stringify(tradeFinanceTokens || []));
      }
      // Append depositAmount to each token record and correctly assign the updated array
      sanitizedRecords = sanitizedRecords.map((record: any) => ({
        ...record, // Retain all existing properties of the record
        depositAmount: depositMap[record.tokenId] ?? 0, // Ensure default value is 0
      }));
      return sanitizedRecords;
    } catch (error) {
      console.error("Error fetching project tokens:", error);
      return [];
    }
  };

  const getSales = async () => {
    const records = await ParseClient.getRecords("TokenSale", [], [], ["*"], undefined, undefined, undefined, "desc");

    // filter based off of
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    // Extract token objectIds
    const tokenObjects = records?.map((token) => token.get("token"));
    const tokenObjectIds = tokenObjects?.map((t) => t.id);

    if (tokenObjectIds && tokenObjectIds.length > 0) {
      const depositQuery = new Parse.Query("TokenDeposit");
      depositQuery.containedIn(
        "token",
        tokenObjectIds.map((id) => new Parse.Object("Token", { id }))
      ); // Use pointers
      const depositRecords = await depositQuery.find();

      // Create a map of deposit amounts
      const depositMap: Record<string, number> = {};

      depositRecords.forEach((deposit) => {
        const tokenId = deposit.get("token").get("tokenId");
        const amount = Number(deposit.get("amount")) || 0;
        depositMap[tokenId] = (depositMap[tokenId] || 0) + amount;
      });

      sanitizedRecords = sanitizedRecords.map((record: any) => ({
        ...record, // Retain all existing properties of the record
        depositAmount: depositMap[record.tokenId] ?? 0, // Ensure default value is 0
        price: record.token.price,
      }));
    }

    return sanitizedRecords;
  };

  const getKpis = async () => {
    // Get all tokens and trade deal deposits
    const allTokens = await ParseClient.getRecords("Token", [], [], ["*"]);
    const tradeDealDeposits = await ParseClient.getRecords("TradeDealUSDCDeposit", [], [], ["*"]);

    // Get all projects and filter for trade finance template
    const projects = await ParseClient.getRecords("TokenProject", [], [], ["*"]);
    const tradeFinanceProjects = new Set(
      projects?.filter((project) => project.attributes.industryTemplate === Industries.TRADE_FINANCE).map((project) => project.id) || []
    );

    // Filter tokens to only include those from trade finance projects
    const tradeFinanceTokens =
      allTokens?.filter((token) => {
        const projectId = token.attributes.projectId;
        return tradeFinanceProjects.has(projectId);
      }) || [];

    // Calculate KPIs using filtered tokens
    const retiredTokens = tradeFinanceTokens.filter((record) => record.attributes.isWithdrawn === true).length;
    const activeTokens = tradeFinanceTokens.filter((record) => record.attributes.isWithdrawn !== true).length;

    const totalRetiredAmount = tradeFinanceTokens.reduce((acc: number, record: any) => {
      if (record.attributes.isWithdrawn === true) {
        return acc + formatUSDC(record.attributes.totalAmount || "0");
      }
      return acc;
    }, 0);

    const activeTokenizedValue = tradeFinanceTokens.reduce((acc: number, record: any) => {
      if (record.attributes.isWithdrawn !== true) {
        return acc + formatUSDC(record.attributes.totalAmount || "0");
      }
      return acc;
    }, 0);

    const totalTokenizedValue = tradeFinanceTokens.reduce((acc: number, record: any) => {
      return acc + formatUSDC(record.attributes.totalAmount || "0");
    }, 0);

    const totalIssuedValue =
      allTokens?.reduce((acc: number, record: any) => {
        let value = 0;
        if (record.attributes.totalAmount) {
          value = formatUSDC(record.attributes.totalAmount || "0");
        } else if (record.attributes.price) {
          value = Number(record.attributes.price);
        }
        return acc + Number(value);
      }, 0) || 0;

    return {
      tokens: allTokens?.length || 0,
      issuedValue: formatPrice(totalIssuedValue, "USD"),
      totalStocks: tradeFinanceTokens.length > 0 ? tradeFinanceTokens.length : undefined,
      retiredTokens: tradeFinanceTokens.length > 0 ? retiredTokens : undefined,
      activeTokens: tradeFinanceTokens.length > 0 ? activeTokens : undefined,
      activeTokenizedValue: tradeFinanceTokens.length > 0 ? formatPrice(activeTokenizedValue, "USD") : undefined,
      totalTokenizedValue: tradeFinanceTokens.length > 0 ? formatPrice(totalTokenizedValue, "USD") : undefined,
      totalRetiredAmount: tradeFinanceTokens.length > 0 ? formatPrice(totalRetiredAmount, "USD") : undefined,
      totalDeposits: tradeDealDeposits?.length || 0,
      totalDepositAmount: Array.isArray(tradeDealDeposits)
        ? tradeDealDeposits.reduce((acc, t) => acc + Number(t.attributes?.amount || 0), 0)
        : undefined,
    };
  };

  const getClaimTopics = async () => {
    let records = await ParseClient.getRecords("ClaimTopic", ["active"], [true], ["*"]);
    return records;
  };

  const createProject = async (projectData: ProjectSaveData) => {
    const [logoFile, coverImageFile] = await Promise.all([
      ParseClient.saveFile("project-logo", { base64: projectData.logo }),
      ParseClient.saveFile("project-cover", { base64: projectData.coverImage }),
    ]);
    const { logo, coverImage, ...updatedProjectData } = projectData;

    return ParseClient.createRecord("TokenProject", [], [], {
      ...updatedProjectData,
      logo: logoFile,
      coverImage: coverImageFile,
    });
  };

  const getProjects = async () => {
    let records = await ParseClient.getRecords("TokenProject", [], [], ["*"]);
    return records;
  };

  const getIdentityRegisteredUser = async () => {
    try {
      // Call the Parse Cloud function `getUsersWithIdentityWallets`
      const response = await ParseClient.run("getUsersWithIdentityWallets");
      console.log("Retrieved users with identity wallets:", response);
      // Return the list of users with wallets if successful
      return { users: response, error: null };
    } catch (error: any) {
      console.error("Error retrieving users with identity wallets:", error);
      // Return null for users and the error message if an error occurs
      return { users: null, error: error.message };
    }
  };

  const getTradeDealDeposits = async () => {
    let records = await ParseClient.getRecords("TradeDealUSDCDeposit", [], [], ["*"]);
    return records;
  };

  const getPoolStats = async () => {
    try {
      const projects = await ParseClient.getRecords("TokenProject", [], [], ["*"]);
      const tradeFinanceProjects = projects?.filter((project) => project.attributes.industryTemplate === Industries.TRADE_FINANCE) || [];

      const activePools = tradeFinanceProjects.filter((project) => project.attributes.isWithdrawn === true).length;

      const retiredPools = tradeFinanceProjects.filter((project) => project.attributes.isWithdrawn !== true).length;

      return {
        activePools,
        retiredPools,
      };
    } catch (error) {
      console.error("Error getting pool stats:", error);
      return {
        activePools: 0,
        retiredPools: 0,
      };
    }
  };

  const getUSDCBalance = async (walletId: string, dfns_token: string) => {
    if (!walletId) {
      throw new Error("Wallet ID is required to get USDC balance.");
    }

    try {
      const balance = await Parse.Cloud.run("dfnsGetUSDC", {
        walletId,
        dfns_token,
      });

      return { balance, error: null };
    } catch (error: any) {
      console.error("Error getting USDC balance:", error);
      return { balance: null, error: error.message };
    }
  };

  return {
    getEvents,
    getMintedNfts,
    getMintedNftDetails,
    getListings,
    getProjectTokens,
    getSales,
    getKpis,
    getClaimTopics,
    createProject,
    getProjects,
    getIdentityRegisteredUser,
    getTradeDealDeposits,
    getPoolStats,
    getUSDCBalance,
  };
};
