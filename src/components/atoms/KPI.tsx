import React, { ReactNode, useState } from "react";

import { Card, Statistic, Radio } from "antd/es";
import classNames from "classnames";

interface IndicatorProps {
  icon: ReactNode;
  title: string;
  value?: string | number;
  firstValue?: string | number;
  firstLabel?: string;
  secondValue?: string | number;
  secondLabel?: string;
  className?: string;
  showToggle?: boolean;
  type: string;
}

const KPI: React.FC<IndicatorProps> = ({
  icon,
  title,
  value,
  firstValue,
  firstLabel = "Active",
  secondValue,
  secondLabel = "Historical",
  className,
  showToggle = false,
  type,
}) => {
  const [showFirstValue, setShowFirstValue] = useState(true);

  const formatValue = (val: string | number | undefined) => {
    if (val === undefined) return "";
    const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : val;
    return type == "number" ? `${num.toLocaleString("en-US")}` : `$ ${num.toLocaleString("en-US")}`;
  };

  const valueColorClass = classNames({
    "text-nomyx-success-light dark:text-nomyx-success-dark": !isNaN(Number(value)) && Number(value) > 0, // Positive values
    "text-nomyx-danger-light dark:text-nomyx-danger-dark": !isNaN(Number(value)) && Number(value) < 0, // Negative values
    "text-nomyx-text-light dark:text-nomyx-text-dark": isNaN(Number(value)) || Number(value) === 0, // Default or zero values
  });

  return (
    <Card className={`flex-1 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark ${className}`}>
      <Statistic
        title={
          <div className="flex flex-col">
            <span className="text-nomyx-gray2-light dark:text-nomyx-gray2-dark text-xl">{title}</span>
            {showToggle && firstValue !== undefined && secondValue !== undefined && (
              <Radio.Group
                value={showFirstValue ? "first" : "second"}
                onChange={(e) => setShowFirstValue(e.target.value === "first")}
                size="small"
                className="mt-1"
              >
                <Radio.Button value="first">{firstLabel}</Radio.Button>
                <Radio.Button value="second">{secondLabel}</Radio.Button>
              </Radio.Group>
            )}
          </div>
        }
        value={value || firstValue || secondValue}
        formatter={() => (
          <div className="flex flex-col">
            {/* Single value display */}
            {value !== undefined && firstValue === undefined && secondValue === undefined && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                {icon}
                <span className={`text-2xl font-semibold ${valueColorClass}`}>{formatValue(value)}</span>
              </div>
            )}

            {/* Toggleable two-value display */}
            {firstValue !== undefined && secondValue !== undefined && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                {icon}
                <span className={`text-2xl font-semibold text-nomyx-success-light dark:text-nomyx-success-dark`}>
                  {showFirstValue ? formatValue(firstValue) : formatValue(secondValue)}
                </span>
              </div>
            )}

            {/* Fallback for when only one value is provided */}
            {(firstValue !== undefined || secondValue !== undefined) && !(firstValue !== undefined && secondValue !== undefined) && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                {icon}
                <span className={`text-2xl font-semibold text-nomyx-success-light dark:text-nomyx-success-dark`}>
                  {formatValue(firstValue || secondValue)}
                </span>
              </div>
            )}
          </div>
        )}
        style={{ textAlign: "center" }}
      />
    </Card>
  );
};

export default KPI;
