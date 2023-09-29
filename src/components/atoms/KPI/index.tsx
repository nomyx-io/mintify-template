import React, { ReactNode } from 'react'

interface IndicatorProps {
  icon: ReactNode;
  title: string;
  value: string | number;
}

const KPI: React.FC<IndicatorProps> = ({ icon, title, value }) => {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-[#f0f0f0] rounded-lg shadow-md w-full max-w-md">
      <div className="min-w-min min-h-min text-blue-500 bg-[#637eab] p-2 rounded-sm">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  )
}

export default KPI