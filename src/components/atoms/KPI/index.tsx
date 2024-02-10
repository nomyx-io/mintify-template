import React, { ReactNode } from 'react';
import {Card} from "antd";

interface IndicatorProps {
  icon: ReactNode;
  title: string;
  value: string | number;
}

const KPI: React.FC<IndicatorProps> = ({ icon, title, value }) => {
  return (
    <Card>
      <div>{icon}</div>
      <div>
        <p>{title}</p>
        <p>{value}</p>
      </div>
    </Card>
  )
}

export default KPI
