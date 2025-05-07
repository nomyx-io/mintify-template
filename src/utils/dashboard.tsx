import { Coin, Setting, ArrowUp, DollarSquare } from "iconsax-react";

import { formatPrice } from "./currencyFormater";

type KPIs = {
  tokens: number;
  totalStocks?: number;
  retiredTokens?: number;
  activeTokens?: number;
  totalRetiredAmount?: string;
  activeTokenizedValue?: string;
  totalTokenizedValue?: string;
  issuedValue?: string;
  totalDeposits?: number;
  totalDepositAmount?: number;
};

type KPIItem = {
  icon: JSX.Element;
  title: string;
  value: number | string | undefined;
};

export function getKPIs(data?: KPIs): KPIItem[] {
  const kpis: KPIItem[] = [
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
  ];

  // Conditionally add other KPIs based on data availability
  if (data?.totalStocks !== undefined) {
    kpis.push({
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Stocks",
      value: data.totalStocks,
    });
  }

  if (data?.activeTokens !== undefined) {
    kpis.push({
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Active Stocks",
      value: data.activeTokens,
    });
  }

  if (data?.activeTokenizedValue !== undefined) {
    kpis.push({
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Active Value of Tokenized Stocks",
      value: data.activeTokenizedValue,
    });
  }

  if (data?.retiredTokens !== undefined) {
    kpis.push({
      icon: <Setting className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Qty. Retired Stocks",
      value: data.retiredTokens,
    });
  }

  if (data?.totalRetiredAmount !== undefined) {
    kpis.push({
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Retired Stocks",
      value: data.totalRetiredAmount,
    });
  }

  if (data?.totalDepositAmount !== undefined) {
    kpis.push({
      icon: <DollarSquare className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Funding",
      value: formatPrice(data.totalDepositAmount, "USD"),
    });
  }

  return kpis;
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
