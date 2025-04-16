import { Coin, Setting, ArrowUp, DollarSquare } from "iconsax-react";

type KPIItem = {
  icon: JSX.Element;
  title: string;
  value: number | string | undefined;
  firstValue?: string | number | undefined;
  firstLabel?: string | undefined;
  secondValue?: string | number | undefined;
  secondLabel?: string | undefined;
  showToggle?: boolean;
};

export function getKPIs(data?: KPIs): KPIItem[] {
  const kpis: (KPIItem | false)[] = [
    {
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Assets",
      value: data?.tokens,
    },
    parseFloat(data?.issuedValue || "0") > 0 && {
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Issued Value",
      value: data?.issuedValue,
    },
    {
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Funding",
      value: data?.totalDepositAmount,
    },
    // {
    //   icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
    //   title: "SPV Pools",
    //   value: undefined,
    //   firstValue: 125,
    //   firstLabel: "Active",
    //   secondValue: 300,
    //   secondLabel: "Total",
    //   showToggle: true,
    // },
  ];

  // Use type guard to ensure only KPIItem objects are returned
  return kpis.filter((item): item is KPIItem => Boolean(item));
}

export function getGraphData(graphValues?: GraphValues) {
  const labels = graphValues?.labels || [];
  const datasets = [
    {
      label: graphValues?.labels[0] || "",
      data: [graphValues?.values[0] || 0, 0],
      backgroundColor: "rgba(33, 102, 248, 0.8)",
    },
    {
      label: graphValues?.labels[1] || "",
      data: [0, graphValues?.values[1] || 0],
      backgroundColor: "rgba(255, 130, 0, 0.8)",
    },
  ];

  return {
    labels,
    datasets,
  };
}
