import React from 'react'
import ParseClient from './Parclient';
import moment from 'moment';
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const ApiHook = () => {
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
        let records = await ParseClient.getRecords('Event', ['event'], ['LlMinted'], ["*"])
        return records
    }
    const getMintedNftDetails = async (id) => {
        let records = await ParseClient.getRecords('Event', ['objectId'], [id], ["*"])
        return records
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

    const getDeposits = async (tokenId) => {
        let records = await ParseClient.getRecords('Deposit', ['tokenId'], [tokenId], ["*"]);
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
        let performanceKpis = records?.[0]?.attributes
        let kpis = {
            totalAssets:tokenRecords?.length,
            totalDeliquent:numberOfFrozen,
            totalAccruedValue:parseInt(performanceKpis?.accruedValue),
            totalAssetValue:parseInt(performanceKpis?.assetValue),
            totalInitialValue:parseInt(performanceKpis?.initialValue),
            totalYieldClaimed:totalYieldClaimed

        }
        return kpis
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
        getKpis
    };
}

