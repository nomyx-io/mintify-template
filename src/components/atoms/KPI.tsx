import React, { ReactNode } from "react";
import { Card, Statistic } from "antd/es";

interface IndicatorProps {
  icon: ReactNode;
  title: string;
  value?: string | number;
  className?: string;
}

const KPI: React.FC<IndicatorProps> = ({ icon, title, value, className }) => {
  return (
    <Card className="flex-1 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark">
      <Statistic
        title={<span className="text-nomyx-gray2-light dark:text-nomyx-gray2-dark">{title}</span>}
        value={value}
        valueStyle={{
          color: !isNaN(Number(value)) && Number(value) > 0 ? "#3f8600" : !isNaN(Number(value)) && Number(value) < 0 ? "#cf1322" : "#fff",
        }}
        prefix={icon}
        style={{ textAlign: "center" }}
      />
    </Card>
  );
};

export default KPI;
