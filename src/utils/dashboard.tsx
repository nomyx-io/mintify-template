import { Coin, Setting, ArrowUp, DollarSquare } from "iconsax-react";

export function getKPIs(data?: KPIs) {
  return [
    {
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Assets",
      value: data?.tokens,
    },
    {
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Issued Value",
      value: data?.issuedValue,
    },
    {
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Retired Value",
      value: data?.retiredValue,
    },
    {
      icon: <Setting className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Carbon Issued",
      value: data?.carbonIssued,
    },
    {
      icon: <Setting className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Carbon Retired",
      value: data?.carbonRetired,
    },
    {
      icon: <ArrowUp className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Retired Tokens",
      value: data?.retired,
    },
  ];
}

export function getGraphData(graphValues?: GraphValues) {
  const labels = graphValues?.labels || [];
  const datasets = [
    {
      label: graphValues?.labels[0] || '',
      data: [graphValues?.values[0] || 0, 0],
      backgroundColor: 'rgba(33, 102, 248, 0.8)',
    },
    {
      label: graphValues?.labels[1] || '',
      data: [0, graphValues?.values[1] || 0],
      backgroundColor: 'rgba(255, 130, 0, 0.8)',
    },
  ];

  return {
    labels,
    datasets,
  };
}
