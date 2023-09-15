import BarChart from '@/components/atoms/Graphs/Barchart';
import { CustomTable } from '@/components/molecules/Table';
import KPI from '@/components/atoms/KPI'
import { EventFeed } from '@/components/molecules/EventFeed'
import React from 'react'

export default function Home() {

  const graphData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
          label: 'Total Initial Value',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Net Asset Value',
        data: [55, 69, 70, 71, 86],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Total Accured Value',
        data: [55, 69, 70, 71, 86],
        backgroundColor: 'yellow',
        borderColor: 'yellow',
        borderWidth: 3,
      },
      {
        type: 'line' as const,
        label: 'Total Yield Value',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'orange',
        borderColor: 'orange',
        borderWidth: 3,
      },
    ],
  };

  const columns = [
    { key: 'id', label: 'Id', align: 'left', unique: true },
    {
      key: 'created_date', label: 'Loan Created', align: 'center'
    },
    { key: 'nft_created', label: 'NFT Created', align: 'center' },
    { key: 'original_value', label: 'Original Value', align: 'center', sortable: true },
    { key: 'current_value', label: 'Current Value', align: 'right', sortable: true },
  ];

  const tableData = [
    { id: 1, created_date: "30/02/23", "nft_created": "30/02/23", "original_value": "200K", "current_value": "254k" },
    { id: 2, created_date: "21/02/23", "nft_created": "30/02/23", "original_value": "210K", "current_value": "354k" },
    { id: 3, created_date: "25/02/23", "nft_created": "30/02/23", "original_value": "300K", "current_value": "204k" }
  ];

  return (
    <div className='w-full grid grid-cols-4 p-5'>

      <div className="col-span-3">

        <KPI
            icon={<svg
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
            }
            title="Activity"
            value="Recent"
        />

        <div className='w-full'>
          <BarChart data={graphData}/>
        </div>

        <CustomTable columns={columns as any} data={tableData} />

      </div>

      <div>
          <EventFeed />
      </div>
    </div>
  )
}
