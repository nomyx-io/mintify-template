import moment from 'moment';
import ParseClient from './ParseClient';
import BlockchainService from "./BlockchainService.ts";
import Error from "next/error";
import config from "@/config.json";
import {formatUnits} from "ethers";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const LenderLabService = () => {

    ParseClient.initialize()
    const getPortfolioPerformance = async () => {
        let records = await ParseClient.getRecords('AssetPerformance', [], [], ["*"])
        // Initialize an object to store monthly balances
        const monthlyBalances = {};
        // Loop through the records and calculate monthly averages
        records && records.forEach((entry) => {
            let record = entry.attributes
            const date = new Date(record.timestamp);
            const year = date.getFullYear();
            const month = date.getMonth()
            const monthKey = `${year}-${monthNames[month]}`;
            if (!monthlyBalances[monthKey]) {
                monthlyBalances[monthKey] = {
                    totalInitialValue: 0,
                    totalAssetValue: 0,
                    totalAccruedValue: 0,
                    totalYieldClaimed: 0,
                    count: 0,
                };
            }
            monthlyBalances[monthKey].totalInitialValue += record.initialValue;
            monthlyBalances[monthKey].totalAssetValue += record.assetValue;
            monthlyBalances[monthKey].totalAccruedValue += record.accruedValue;
            monthlyBalances[monthKey].totalYieldClaimed += record.yieldClaimed;
            monthlyBalances[monthKey].count++;
        });
        let graphFormatData = {
            labels: [],
            initialValues: [],
            assetValues: [],
            accruedValues: [],
            yieldClaimedTill: []
        }
        // Calculate monthly averages and store them in an array
        const monthlyAverages = Object.keys(monthlyBalances).map((monthKey) => {
            const { totalInitialValue, totalAssetValue, totalAccruedValue, totalYieldClaimed, count } = monthlyBalances[monthKey];
            graphFormatData.labels.push(monthKey)
            graphFormatData.initialValues.push(totalInitialValue / count)
            graphFormatData.assetValues.push(totalAssetValue / count)
            graphFormatData.accruedValues.push(totalAccruedValue / count)
            graphFormatData.yieldClaimedTill.push(totalYieldClaimed / count)
            return {
                month: monthKey,
                averageInitialValue: totalInitialValue / count,
                averageAssetValue: totalAssetValue / count,
                averageAccruedValue: totalAccruedValue / count,
                averageYieldClaimed: totalYieldClaimed / count,
            };
        });
        return graphFormatData;
    }
    const getEvents = async () => {
        try {
            let records = await ParseClient.getRecords('Event', [], [], ["*"])
            let dateWiseData = {};
            const todayEvents = [];

            records && records.forEach((entry) => {
                let record = entry.attributes;

                // console.log("record.updatedAt = ", record.updatedAt);
                const eventDate = record.updatedAt.toISOString().split('T')[0] == moment().format('yyyy-MM-DD') ? 'Today' : record.updatedAt.toISOString().split('T')[0];

                const eventData = {
                    name: record?.event,
                    // description: "description",
                    value: 1
                };

                if (!dateWiseData[eventDate]) {
                    dateWiseData[eventDate] = { data: [eventData] };
                } else {
                    const existingEvent = dateWiseData[eventDate].data.find(e => e.name === eventData.name);
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
                Object.entries(dateWiseData).sort(([a], [b]) => new Date(b) - new Date(a))
            );
            return sortedDateWiseData;
        } catch (error) {
            console.log(error);
        }
    }
    const getMintedNfts = async () => {
        let records = await ParseClient.getRecords('Token', undefined, undefined, ["*"]);
        return records
    }
    const getMintedNftDetails = async (id) => {
        let records = await ParseClient.get('Token', id);
        return JSON.parse(JSON.stringify(records));
    }

    const getSaleTokens = async(tokenId) => {
        let records = await ParseClient.getRecords('TokenSale', ['tokenId'], [tokenId], ["*"]);
        return records
    }

    const getListings = async (tokenId) => {
        let records = await ParseClient.getRecords('Listing', ['tokenId'], [tokenId], ["*"]);
        return records
    }

    const getTreasuryClaims = async (tokenId) => {
        let records = await ParseClient.getRecords('TreasuryClaim', ['tokenId'], [tokenId], ["*"]);
        return records
    }

    const getKpis = async (id) => {
        let records = await ParseClient.getRecords('AssetPerformance', [], [], ["*"], 1, 0, 'createdAt', 'desc')
        let tokenRecords = await ParseClient.getRecords('Token', [], [], ["*"])
        let numberOfFrozen = 0
        let totalYieldClaimed = 0
        let queryTreasuryWithdrawnresults = await ParseClient.getRecords('Event', ['event'], ['TreasuryWithdrawn'], ["*"])
        if (queryTreasuryWithdrawnresults && queryTreasuryWithdrawnresults.length > 0) {
            queryTreasuryWithdrawnresults.forEach(element => {
                totalYieldClaimed += Number(element.attributes?.amount);
            });
        }
        tokenRecords && tokenRecords.length > 0 && tokenRecords.forEach((data) => {
            if (data.attributes?.frozen) {
                numberOfFrozen += 1
            }
        })

        let performanceKpis = records?.[0]?.attributes;

        let kpis = {
            totalAssets:tokenRecords?.length,
            totalDeliquent:numberOfFrozen,
            totalAccruedValue:parseInt(performanceKpis?.accruedValue),
            totalAssetValue:parseInt(String(performanceKpis?.assetValue||0), 10),
            totalInitialValue:parseInt(performanceKpis?.initialValue),
            totalYieldClaimed:totalYieldClaimed

        }
        return kpis
    }

    const saveSettings = async (settingsObj) => {

        const parseSaveRequestPromises = [];

        let tokenRecords = await ParseClient.getRecords('ERC721', [], [], ["*"]);

        if (tokenRecords && tokenRecords.length > 0 && settingsObj.defaultTokenImage) {
            let tokenRecord = tokenRecords[0];

            let parseFile = settingsObj.defaultTokenImage ? 
                await ParseClient.saveFile('token-image', settingsObj.defaultTokenImage) :
                null;

            parseSaveRequestPromises.push(ParseClient.updateRecord('ERC721', tokenRecord.id, { 'defaultTokenImage': parseFile }));
        }

        //save other settings by iterating through settingsObj key/value pairs, skipping the defaultTokenImage key
            //for each prop on settingsObj
                //skip defaultTokenImage prop
                //create new LenderLabSetting record for key/value pair
            //save settings to Parse
            //parseSaveRequestPromises.push(saveSettingsRecordsPromise);

        for (let k in settingsObj) {

            let setting = settingsObj[k];

            console.log("k = ", k);

            if (k == 'defaultTokenImage') continue;
            
            parseSaveRequestPromises.push(ParseClient.createOrUpdateRecord(
                'LenderLabSetting', 
                ['key'], 
                [k], 
                {key:k, value: typeof setting == 'object' ? JSON.stringify(setting) : setting} 
            ));
            
        }

        return Promise.all(parseSaveRequestPromises);

    }

    const getSettings = async () => {   
        let records = await ParseClient.getRecords('LenderLabSetting', [], [], ["*"]);
        let settingsObj = {};

        if(records && records.length > 0){
            records.forEach(record => {
                settingsObj[record.attributes.key] = record.attributes.value;
            });
        }
        
        let tokenRecords = await ParseClient.getRecords('ERC721', [], [], ["*"]);

        if (tokenRecords && tokenRecords.length > 0) {
            let tokenRecord = tokenRecords[0];
            settingsObj.defaultTokenImage = tokenRecord.attributes.defaultTokenImage;
        }    

        return settingsObj;
        
    }

    const getClaimTopics = async () => {
        let records = await ParseClient.getRecords('ClaimTopic', ['active'], [true], ["*"]);
        return records;
    }

    const getDeposits = async () => {
        let records = await ParseClient.getRecords('Deposit', undefined, undefined, ["*"],undefined,
            undefined,
            undefined,
            'desc');

        const sanitizedRecords = JSON.parse(JSON.stringify(records));
        sanitizedRecords.forEach(record => {record.totalAmount = formatUnits(record.totalAmount, 6)});
        return sanitizedRecords;
    }

    const getTokenDepositsForDepositId = async (depositId) => {
        return getTokenDeposits(["deposit"], [{
            __type: 'Pointer',
            className: 'Deposit',
            objectId: depositId
        }]);
    }

    const getTokenDepositsForToken = async (objectId) => {
        return getTokenDeposits(["token"], [{
            __type: 'Pointer',
            className: 'Token',
            objectId
        }]);
    }

    const getTokenDeposits = async (whereColumns, whereValues) => {
        let records = await ParseClient.getRecords('TokenDeposit', whereColumns, whereValues, ["*"]);
        const sanitizedRecords = JSON.parse(JSON.stringify(records));

        sanitizedRecords.forEach(record => {
            record.amount = formatUnits(record.amount, 6);
        });

        return sanitizedRecords?.sort((a, b) => {
            return parseInt(a.token.tokenId) < parseInt(b.token.tokenId) ? -1 : 1;
        });
    }

    const deposit = async (depositData) => {

        let loanIds = depositData.map((depositItem)=>depositItem.loan_id.toString());
        let tokens = await ParseClient.getRecords('Token', "loanId", loanIds, ["*"]);

        if(tokens.length<depositData.length){
            throw new Error("The file you selected contains entries that do not match any existing loans. Please check the file and try again.");
        }

        const tokensMap = tokens.reduce((accumulator,token)=>{
            accumulator[token.attributes.loanId] = token;
            return accumulator;
        }, {});

        depositData = depositData.map((depositItem)=>{return {tokenId:parseInt(tokensMap[depositItem.loan_id].attributes.tokenId), amount:depositItem.amount}});

        return BlockchainService.getInstance().deposit(depositData);

    }

    const getTreasuryData = async () => {

        let hudDataUrl = `${config.serverURL}/gemforce/lenderlab-treasury-hud`;

        try {
            const response = await fetch(hudDataUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching Treasury data:', error);
            throw error;
        }

    }



    return {
        getPortfolioPerformance,
        getEvents,
        getMintedNfts,
        getMintedNftDetails,
        getSaleTokens,
        getListings,
        getTreasuryClaims,
        getDeposits,
        getTokenDepositsForDepositId,
        getTokenDepositsForToken,
        getKpis,
        saveSettings,
        getSettings,
        getClaimTopics,
        deposit,
        getTreasuryData
    };
}
