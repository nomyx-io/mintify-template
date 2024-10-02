import { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Coin, Setting, ArrowUp } from "iconsax-react";

export function getKPIs(data?: KPIs) {
  return [
    {
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Assets",
      value: data?.totalAssets,
    },
    {
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Issued Value",
      value: data?.totalInitialValue,
    },
    {
      icon: <Coin className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Redeemed Value",
      value: data?.totalAssetValue,
    },
    {
      icon: <Setting className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Carbon Issued",
      value: data?.totalAccruedValue,
    },
    {
      icon: <Setting className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Carbon Redeemed",
      value: data?.totalYieldClaimed,
    },
    {
      icon: <ArrowUp className="text-nomyx-text-light dark:text-nomyx-text-dark" />,
      title: "Total Redeemed Credits",
      value: data?.totalDeliquent,
    },
  ];
}

export function getGraphData(graphValues?: PortfolioPerformance) {
  return {
    labels: graphValues?.labels || [],
    datasets: [
      {
        type: "line" as const,
        label: "Total Accured Value",
        data: graphValues?.accruedValues || [],
        backgroundColor: "#fc4103",
        borderColor: "#fc4103",
        borderWidth: 3,
        fill: false,
      },
      {
        type: "line" as const,
        label: "Total Yield Value",
        data: graphValues?.yieldClaimedTill || [],
        backgroundColor: "#fc8c03",
        borderColor: "#fc8c03",
        borderWidth: 3,
        fill: false,
      },
      {
        label: "Total Initial Value",
        data: graphValues?.initialValues || [],
        backgroundColor: "#2f59d6",
        borderWidth: 0,
        barThickness: 30,
        categoryPercentage: 0.5,
        barPercentage: 1,
      },
      {
        label: "Net Asset Value",
        data: graphValues?.assetValues || [],
        backgroundColor: "#7a7977",
        borderColor: "#7a7977",
        borderWidth: 0,
        barThickness: 30,
        categoryPercentage: 0.5,
        barPercentage: 1,
      },
    ],
  };
}

export const DASHBOARD_COLUMNS: ColumnsType<MintedToken> = [
  {
    dataIndex: "id",
    title: "Id",
    align: "left",
    render: (recordId: string) => {
      return (
        <Link href={`/nft-detail/${recordId}`} className="text-light-blue-500 cursor-pointer">
          {" "}
          {recordId}{" "}
        </Link>
      );
    },
  },
  { dataIndex: "_tokenId", title: "Token Id", align: "center" },
  { dataIndex: "_loanId", title: "Loan Id", align: "center" },
  { dataIndex: "_createdAt", title: "NFT Created", align: "center" },
  {
    dataIndex: "_amount",
    title: "Original Value",
    align: "center",
    sorter: true,
  },
  {
    dataIndex: "_currentValue",
    title: "Current Value",
    align: "right",
    sorter: true,
  },
];
