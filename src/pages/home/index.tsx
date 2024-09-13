'use client'
import KPI from '@/components/atoms/KPI'
import {KronosService} from '@/services/KronosService'
import {EventFeed} from '@/components/molecules/EventFeed'
import React, {useEffect, useState} from 'react'
import {getDashboardLayout} from '@/Layouts';
import BarChart from '@/components/atoms/Graphs/Barchart';
import moment from 'moment';
import {useRouter} from 'next/navigation';
import {Card, Table, Tabs} from 'antd';
import PubSub from 'pubsub-js';

export default function Home() {

    console.log("Home");

    const router = useRouter()
    const api = KronosService()
    const [graphValues, setGraphValues] = useState<any>([])
    const [eventDetails, setEventDetails] = useState<any>({})
    const [mintedNfts, setMintedNfts] = useState<any>([])
    const [kpisData, setkpisData] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('all')
    const [loading, setLoading] = useState(false)

    const KPIS = [
        {
            icon: <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                height={24}
                width={24}
            >
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 8 12 12 16 16"/>
                <line x1="8" y1="12" x2="12" y2="12"/>
            </svg>
            ,
            title: "Total Assets",
            value: kpisData?.totalAssets
        },
        {
            icon: <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                height={24}
                width={24}
            >
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 8 12 12 16 16"/>
                <line x1="8" y1="12" x2="12" y2="12"/>
            </svg>
            ,
            title: "Total Initial Value",
            value: kpisData?.totalInitialValue
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                <text x="50%" y="50%" textAnchor="middle" fontSize="20" dy=".3em" fill="#fff">$</text>
            </svg>,
            title: "Total Asset Value",
            value: kpisData?.totalAssetValue
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                <text x="50%" y="50%" textAnchor="middle" fontSize="20" dy=".3em" fill="#fff">$</text>
            </svg>,
            title: "Total Yield Generated",
            value: kpisData?.totalAccruedValue
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                <text x="50%" y="50%" textAnchor="middle" fontSize="20" dy=".3em" fill="#fff">$</text>
            </svg>,
            title: "Total Yield Claimed",
            value: kpisData?.totalYieldClaimed
        },
        {
            icon: <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="white"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,0,0)"
            >
                <path
                    d="M10 3.125V16.875M10 16.875L4.375 11.25M10 16.875L15.625 11.25"
                    stroke="white"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>,
            title: "Total Delinquent NBTs",
            value: kpisData?.totalDeliquent
        }];

    const graphData = {
        labels: graphValues?.labels || [],
        datasets: [
            {
                type: 'line' as const,
                label: 'Total Accured Value',
                data: graphValues?.accruedValues || [],
                backgroundColor: '#fc4103',
                borderColor: '#fc4103',
                borderWidth: 3,
                fill: false,
            },
            {
                type: 'line' as const,
                label: 'Total Yield Value',
                data: graphValues?.yieldClaimedTill || [],
                backgroundColor: '#fc8c03',
                borderColor: '#fc8c03',
                borderWidth: 3,
                fill: false,
            },
            {
                label: 'Total Initial Value',
                data: graphValues?.initialValues || [],
                backgroundColor: '#2f59d6',
                borderWidth: 0,
                barThickness: 30,
                categoryPercentage: 0.5,
                barPercentage: 1,
            },
            {
                label: 'Net Asset Value',
                data: graphValues?.assetValues || [],
                backgroundColor: '#7a7977',
                borderColor: '#7a7977',
                borderWidth: 0,
                barThickness: 30,
                categoryPercentage: 0.5,
                barPercentage: 1,
            }

        ]
    }

    const columns: any = [
        {
            dataIndex: 'id', title: 'Id', align: 'left', unique: true, render: ((recordId: any) => {
                return (
                    <div className='text-light-blue-500 cursor-pointer'
                         onClick={() =>
                             router.push(`/nft-detail/${recordId}`)
                         }>{recordId}</div>
                );
            })
        },
        {dataIndex: '_tokenId', title: 'Token Id', align: 'center'},
        {dataIndex: '_loanId', title: 'Loan Id', align: 'center'},
        {dataIndex: '_createdAt', title: 'NFT Created', align: 'center'},
        {dataIndex: '_amount', title: 'Original Value', align: 'center', sortable: true},
        {dataIndex: '_currentValue', title: 'Current Value', align: 'right', sortable: true},
    ];

    const tabsData = [
        {
            label: "All",
            value: "all",
        },
        {
            label: "NFTS",
            value: "nfts",
        },
        {
            label: "Minted",
            value: "minted",
        }
    ];

    useEffect(() => {
        async function getData() {

            setLoading(true);

            let mintedNfts: any = await api.getMintedNfts();
            let events = await api.getEvents();
            let data = await api.getPortfolioPerformance();
            let kpis = await api.getKpis();

            for (let index = 0; index < mintedNfts?.length; index++) {
                mintedNfts[index]._createdAt = moment(mintedNfts[index].createdAt).format('YYYY-MM-DD');
                mintedNfts[index]._amount = (mintedNfts[index].attributes.loanAmount || "");
                mintedNfts[index]._originationDate = (mintedNfts[index].attributes.originationDate || "");
                mintedNfts[index]._currentValue = (mintedNfts[index].attributes.currentValue || "");
                mintedNfts[index]._loanId = (mintedNfts[index].attributes.loanId || "");
                mintedNfts[index]._tokenId = (mintedNfts[index].attributes.tokenId || "");
            }

            setkpisData(kpis);
            setMintedNfts(mintedNfts);
            setEventDetails(events);
            setGraphValues(data);

            setLoading(false);
            PubSub.publish("PageLoad");
        }

        getData();
    }, []);

    return (

            <div className='w-full grid grid-cols-4 gap-3'>
                <div className="grid col-span-3 gap-y-3">
                    <div className="grid grid-cols-3 items-center gap-3 flex-wrap">
                        {KPIS && KPIS.map((kpi) => (
                            <KPI
                                key={kpi.title}
                                icon={kpi.icon}
                                title={kpi.title}
                                value={kpi.value}
                            />
                        ))}
                    </div>

                    <Card className='w-full no-padding'>

                        <Tabs>
                            <Tabs.TabPane tab="Performance" key="1">
                                <BarChart data={graphData} title="Net Asset Value & Yield"/>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Assets" key="2">
                                <Table columns={columns} dataSource={mintedNfts}/>
                            </Tabs.TabPane>
                        </Tabs>

                    </Card>
                </div>
                <Card className='no-padding h-[90vh] overflow-y-auto'>
                    <EventFeed
                        data={eventDetails}
                        tabsData={tabsData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}/>
                </Card>
            </div>
    );
}

Home.getLayout = getDashboardLayout;
Home.handleLoad = true;
