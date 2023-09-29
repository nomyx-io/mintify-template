import React from 'react'
import ParseClient from './Parclient';
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
            const today = new Date().toISOString().split('T')[0];
            const todayEvents = [];
            const pastEvents = [];
            records && records.forEach((entry) => {
                let record = entry.attributes
                const eventDate = record.updatedAt.toISOString().split('T')[0];
                if (eventDate === today) {
                    todayEvents.push({
                        name: record?.event,
                        description: "description",
                        value: "value"
                    });
                } else if (eventDate < today) {
                    pastEvents.push({
                        name: record?.event,
                        description: "description",
                        value: "value"
                    });
                }
            });
            return {
                "Today": { data: todayEvents },
                "Past": { data: pastEvents }
            }
        } catch (error) {
            console.log(error);
        }
    }
    const getMintedNfts=async()=>{
        let records = await ParseClient.getRecords('Event', ['event'], ['LlMinted'], ["*"])
        return records
    }
    const getMintedNftDetails=async(id)=>{
        let records = await ParseClient.getRecords('Event', ['objectId'], [id], ["*"])
        return records
    }
    return {
        getPortfolioPerformance,
        getEvents,
        getMintedNfts,
        getMintedNftDetails
    };
}

