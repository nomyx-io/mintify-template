import React, { ReactNode } from "react";

import { Card, Statistic } from "antd/es";
import classNames from "classnames";

interface IndicatorProps {
  icon: ReactNode;
  title: string;
  value?: string | number;
  className?: string;
}

const KPI: React.FC<IndicatorProps> = ({ icon, title, value, className }) => {
  const valueColorClass = classNames({
    "text-nomyx-success-light dark:text-nomyx-success-dark": !isNaN(Number(value)) && Number(value) > 0, // Positive values
    "text-nomyx-danger-light dark:text-nomyx-danger-dark": !isNaN(Number(value)) && Number(value) < 0, // Negative values
    "text-nomyx-text-light dark:text-nomyx-text-dark": isNaN(Number(value)) || Number(value) === 0, // Default or zero values
  });

  return (
    <Card className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
      <Statistic
        title={<span className="text-nomyx-gray2-light dark:text-nomyx-gray2-dark">{title}</span>}
        value={value}
        formatter={() => (
          <div className="flex items-center space-x-2 overflow-hidden">
            {icon}
            <span className={classNames(valueColorClass, "truncate text-lg sm:text-xl font-semibold max-w-[10rem]")} title={value?.toString()}>
              {value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
        )}
        style={{ textAlign: "center" }}
      />
    </Card>
  );
};

export default KPI;
