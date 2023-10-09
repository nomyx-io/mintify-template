'use client'
import { CustomTable } from '@/components/molecules/Table';
import KPI from '@/components/atoms/KPI'
import { ApiHook } from '@/services/api'
import { EventFeed } from '@/components/molecules/EventFeed'
import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '../Layouts';
import BarChart from '@/components/atoms/Graphs/Barchart';
import moment from 'moment';
import { useRouter } from 'next/navigation';
export default function Home() {
  const router = useRouter()
  const api = ApiHook()
  const [graphValues, setGraphValues] = useState<any>([])
  const [eventDetails, setEventDetails] = useState<any>({})
  const [mintedNfts, setMintedNfts] = useState<any>([])
  const [activeTab, setActiveTab] = useState('all')

  const KPIS = [{
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
    title: "Activity",
    value: "Recent"
  }, {
    icon: <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="white"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path
        d="M10 3.125V16.875M10 16.875L4.375 11.25M10 16.875L15.625 11.25"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    ,
    title: "Income",
    value: "Earnings"
  }, {
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
    </svg>
    ,
    title: "Expenses",
    value: "Spending"
  }]

  function findValueByKey(array: any, key: any) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] === key) {
            return array[i][2];
        }
    }
    return 0;
  }

  useEffect(() => {
    async function getData() {
      let mintedNfts: any = await api.getMintedNfts()
      let events = await api.getEvents()
      let nftDetails = await api.getMintedNftDetails(mintedNfts?.[0]?.id)
      let data = await api.getPortfolioPerformance()
      setMintedNfts(mintedNfts)
      setEventDetails(events)
      setGraphValues(data)
    }
    getData()
  }, [])

  const graphData = {
    labels: graphValues?.labels || [],
    datasets: [
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
      },
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

    ]
  }
  console.log(mintedNfts)

  const columns = [
    { key: 'id', label: 'Id', align: 'left', unique: true, render:  ((row: any) => (
      <div className='text-light-blue-500 cursor-pointer' onClick={() => router.push(`/detail-view?${row.id}`)}>{row.id}</div>
    )) },
    {
      key: '_createdAt', label: 'Loan Created', align: 'center'
    },
    { key: '_createdAt', label: 'NFT Created', align: 'center' },
    { key: '_amount', label: 'Original Value', align: 'center', sortable: true },
    { key: '_amount', label: 'Current Value', align: 'right', sortable: true },
  ];

  const tableData = [
    { id: 1, created_date: "30/02/23", "nft_created": "30/02/23", "original_value": "200K", "current_value": "254k" },
    { id: 2, created_date: "21/02/23", "nft_created": "30/02/23", "original_value": "210K", "current_value": "354k" },
    { id: 3, created_date: "25/02/23", "nft_created": "30/02/23", "original_value": "300K", "current_value": "204k" }
  ];

  const TabsData = [
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

  return (
    <div className='w-full grid grid-cols-4 p-5 gap-x-6'>
      <div className="col-span-3 py-2">
        <div className="flex items-center justify-between gap-x-6">
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
        <CustomTable columns={columns as any} data={mintedNfts} />
      </div>
      <div className='p-2'>
        <div className='text-black text-lg font-bold'>Form</div>
        <EventFeed data={eventDetails} TabsData={TabsData} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div >
    </div >
  )
}
Home.getLayout = getDashboardLayout;