import KPI from '@/components/atoms/KPI'
import React from 'react'

export default function Home() {
  return (
    <div className='w-full'>
      HomePage
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
    </div>
  )
}
