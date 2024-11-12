import moment from 'moment';
import ParseClient from './ParseClient';

export const CustomerService = () => {
  ParseClient.initialize();
  
  const getEvents = async () => {
    try {
      let records = await ParseClient.getRecords('Event', [], [], ['*']);
      let dateWiseData: { [key: string] : { data: {name: string, value: number}[] } } = {};
      const todayEvents = [];

      records &&
        records.forEach((entry) => {
          let record = entry.attributes;

          const eventDate =
            record.updatedAt.toISOString().split('T')[0] ==
            moment().format('yyyy-MM-DD')
              ? 'Today'
              : record.updatedAt.toISOString().split('T')[0];

          const eventData = {
            name: record?.event,
            // description: "description",
            value: 1,
          };

          if (!dateWiseData[eventDate]) {
            dateWiseData[eventDate] = { data: [eventData] };
          } else {
            const existingEvent = dateWiseData[eventDate].data.find(
              (e) => e.name === eventData.name
            );
            if (existingEvent) {
              existingEvent.value++;
            } else {
              dateWiseData[eventDate].data.push(eventData);
            }
          }
          if (eventDate === 'Today') {
            todayEvents.push(eventData);
          }
        });
      if (dateWiseData.hasOwnProperty('Today')) {
        const todayData = dateWiseData.Today;
        delete dateWiseData.Today;
        dateWiseData = { Today: todayData, ...dateWiseData };
      }
      // Sort events by date in descending order
      const sortedDateWiseData = Object.fromEntries(
        Object.entries(dateWiseData).sort(
          ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
        )
      );
      return sortedDateWiseData;
    } catch (error) {
      console.log(error);
    }
  };
  const getMintedNfts = async () => {
    let records = await ParseClient.getRecords('Token', undefined, undefined, [
      '*',
    ]);
    return records;
  };
  const getMintedNftDetails = async (id: string) => {
    let records = await ParseClient.get('Token', id);
    return JSON.parse(JSON.stringify(records));
  };

  const getListings = async (fieldNames: string[], fieldValues: any[]) => {
    const records = await ParseClient.getRecords(
      'TokenListing',
      fieldNames,
      fieldValues,
      ['*'],
      undefined,
      undefined,
      undefined,
      'desc'
    );
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    return sanitizedRecords;
  };

  const getProjectTokens = async (fieldNames: string[], fieldValues: any[]) => {
    const records = await ParseClient.getRecords(
      'Token',
      fieldNames,
      fieldValues,
      ['*'],
      undefined,
      undefined,
      undefined,
      'desc'
    );
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    return sanitizedRecords;
  };

  const getSales = async () => {
    const records = await ParseClient.getRecords(
      'TokenSale',
      [],
      [],
      ['*'],
      undefined,
      undefined,
      undefined,
      'desc'
    );

    // filter based off of
    let sanitizedRecords = [];

    if (records && records.length > 0) {
      sanitizedRecords = JSON.parse(JSON.stringify(records || []));
    }

    return sanitizedRecords;
  };

  const getTreasuryClaims = async (tokenId:string) => {
    let records = await ParseClient.getRecords(
      'TreasuryClaim',
      ['tokenId'],
      [tokenId],
      ['*']
    );
    return records;
  };

  const getKpis = async () => {
    const tokenRecords = await ParseClient.getRecords('Token', [], [], ['*']);
    const retiredCredits = await ParseClient.getRecords(
      'CarbonCreditsRetired__e',
      [],
      [],
      ['*']
    );
    const retiredTokens: Parse.Object[] = [];
    retiredCredits?.forEach((record) => {
      const token = tokenRecords?.find(
        (token) => token.attributes.tokenId === record.attributes.tokenId
      );
      token && retiredTokens.push(token);
    });

    return {
      tokens: tokenRecords?.length || 0,
      retired: retiredTokens.length || 0,
      issuedValue: tokenRecords?.reduce(
        (acc, record) =>
          acc +
          Number(record.attributes.price) *
            Number(record.attributes.existingCredits),
        0
      ) || 0,
      retiredValue: retiredTokens.reduce(
        (acc, record) =>
          acc +
          Number(record.attributes.price) *
            Number(record.attributes.existingCredits),
        0
      ) || 0,
      carbonIssued: tokenRecords?.reduce(
        (acc, record) => acc + Number(record.attributes.existingCredits),
        0
      ) || 0,
      carbonRetired: retiredTokens.reduce(
        (acc, record) => acc + Number(record.attributes.existingCredits),
        0
      ) || 0,
    };
  };

  const getClaimTopics = async () => {
    let records = await ParseClient.getRecords(
      'ClaimTopic',
      ['active'],
      [true],
      ['*']
    );
    return records;
  };

  const getTreasuryData = async () => {
    let hudDataUrl = `${process.env.NEXT_PUBLIC_PARSE_SERVER_URL}/gemforce/lenderlab-treasury-hud`;

    try {
      const response = await fetch(hudDataUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Treasury data:', error);
      throw error;
    }
  };

  const createProject = async (projectData: ProjectSaveData) => {
    const [logo, cover] = await Promise.all([
      ParseClient.saveFile('project-logo', { base64: projectData.logo }),
      ParseClient.saveFile('project-cover', { base64: projectData.coverImage }),
    ]);

        return ParseClient.createRecord('TokenProject', [], [], {...projectData, logo, cover});
    }

    const getProjects = async () => {
        let records = await ParseClient.getRecords('TokenProject', [], [], ["*"]);
        return records;
    }

  return {
    getEvents,
    getMintedNfts,
    getMintedNftDetails,
    getListings,
    getProjectTokens,
    getSales,
    getTreasuryClaims,
    getKpis,
    getClaimTopics,
    getTreasuryData,
    createProject,
    getProjects,
  };
};
