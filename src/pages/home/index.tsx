'use client'
import KPI from '@/components/atoms/KPI'
import { LenderLabService } from '@/services/LenderLabService'
import { EventFeed } from '@/components/molecules/EventFeed'
import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '@/Layouts';
import BarChart from '@/components/atoms/Graphs/Barchart';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Spin, Table } from 'antd';

export default function Home() {
  const router = useRouter()
  const api = LenderLabService()
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 8 12 12 16 16" />
        <line x1="8" y1="12" x2="12" y2="12" />
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 8 12 12 16 16" />
        <line x1="8" y1="12" x2="12" y2="12" />
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

  const columns:any = [
    { dataIndex: 'id', title: 'Id', align: 'left', unique: true, render:  (({record}:any) => (
          <div className='text-light-blue-500 cursor-pointer' onClick={() => router.push(`/nft-detail/${record.id}`)}>{record.id}</div>
      )) },
    { dataIndex: '_tokenId', title: 'Token Id', align: 'center'},
    { dataIndex: '_loanId', title: 'Loan Id', align: 'center'},
    { dataIndex: '_createdAt', title: 'NFT Created', align: 'center' },
    { dataIndex: '_amount', title: 'Original Value', align: 'center', sortable: true },
    { dataIndex: '_currentValue', title: 'Current Value', align: 'right', sortable: true },
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
      setLoading(true)
      let mintedNfts: any = await api.getMintedNfts()
      let events = await api.getEvents()
      let data = await api.getPortfolioPerformance()
      let kpis = await api.getKpis()
      for (let index = 0; index < mintedNfts?.length; index++) {
        mintedNfts[index]._createdAt = moment(mintedNfts[index].attributes.createdAt).format('YYYY-MM-DD')
        mintedNfts[index]._amount = (mintedNfts[index].attributes.loanAmount||"");
        mintedNfts[index]._originationDate = (mintedNfts[index].attributes.originationDate||"")
        mintedNfts[index]._currentValue = (mintedNfts[index].attributes.currentValue||"");
        mintedNfts[index]._loanId = (mintedNfts[index].attributes.loanId||"");
        mintedNfts[index]._tokenId = (mintedNfts[index].attributes.tokenId||"");
      }
      setkpisData(kpis)
      setMintedNfts(mintedNfts)
      setEventDetails(events)
      setGraphValues(data)
      setLoading(false)
    }
    getData()
  }, []);

  return (
      loading ? <div className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]'>
            <Spin />
          </div> :
          <div className='w-full grid grid-cols-4 p-5 gap-x-2'>
            <div className="col-span-3 py-2">
              <div className="flex items-center gap-4 flex-wrap">
                {KPIS && KPIS.map((kpi) => (
                    <KPI
                        key={kpi.title}
                        icon={kpi.icon}
                        title={kpi.title}
                        value={kpi.value}
                    />
                ))}
              </div>
              <br />

              <div className='w-full'>
                <BarChart data={graphData} title="Net Asset Value & Yield" />
              </div>
              <br />
              {/*<CustomTable columns={columns as any} data={mintedNfts} />*/}
              <Table columns={columns}  dataSource={mintedNfts}/>
            </div>
            <div className='p-2 h-[90vh] overflow-y-auto'>
              <EventFeed data={eventDetails} tabsData={tabsData} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div >
          </div >
  )
}
Home.getLayout = getDashboardLayout;
