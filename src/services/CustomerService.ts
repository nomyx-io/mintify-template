import moment from "moment";

import { formatPrice } from "@/utils/currencyFormater";

import ParseClient from "./ParseClient";

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
    const records = await ParseClient.getRecords("Token", fieldNames, fieldValues, ["*"], undefined, undefined, undefined, "desc");
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    return sanitizedRecords;
  };

  const getSales = async () => {
    const records = await ParseClient.getRecords("TokenSale", [], [], ["*"], undefined, undefined, undefined, "desc");

    // filter based off of
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    return sanitizedRecords;
  };

  const getKpis = async () => {
    const tokenRecords = await ParseClient.getRecords("Token", [], [], ["*"]);
    return {
      tokens: tokenRecords?.length || 0,
      issuedValue: formatPrice(
        tokenRecords?.reduce((acc: number, record: any) => {
          const price = parseFloat(record.attributes.price) || 0; // Safely parse the price
          return acc + price;
        }, 0) ?? 0,
        "USD"
      ),
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
  };
};
