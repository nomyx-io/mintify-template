"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Card, Tabs } from "antd";

import BarChart from "@/components/atoms/Graphs/Barchart";
import KPI from "@/components/atoms/KPI";
import { EventFeed } from "@/components/molecules/EventFeed";
import { getDashboardLayout } from "@/Layouts";
import { CustomerService } from "@/services/CustomerService";
import { getGraphData, getKPIs } from "@/utils/dashboard";

export default function Home() {
  const api = useMemo(() => CustomerService(), []);
  const [tokenGraphValues, setTokenGraphValues] = useState<GraphValues>();
  const [stocksGraphValues, setStocksGraphValues] = useState<GraphValues>();
  const [stocksValueGraphValues, setStocksValueGraphValues] = useState<GraphValues>();
  const [carbonGraphValues, setCarbonGraphValues] = useState<GraphValues>();
  const [eventDetails, setEventDetails] = useState<Events>({});
  const [kpisData, setkpisData] = useState<KPIs>();

  const fetchData = useCallback(async () => {
    try {
      const [events, kpis] = await Promise.all([api.getEvents(), api.getKpis()]);

      setkpisData(kpis);
      setEventDetails(events || {});

      // Set stocks graph data
      setStocksGraphValues({
        labels: ["Total Stocks Outstanding", "Total Stocks Retired"],
        values: [kpis?.activeTokens || 0, kpis?.retiredTokens || 0],
      });

      // Set stocks value graph data
      setStocksValueGraphValues({
        labels: ["Total Stocks Outstanding ($)", "Total Stocks Paid-off ($)"],
        values: [
          parseFloat(kpis?.activeTokenizedValue?.replace(/[^0-9.-]+/g, "") || "0"),
          parseFloat(kpis?.totalRetiredAmount?.replace(/[^0-9.-]+/g, "") || "0"),
        ],
      });

      if (kpis?.totalDeposits > 0) {
        setTokenGraphValues({
          labels: ["Total Tokens Issued", "Total Deposits"],
          values: [kpis.tokens, kpis.totalDeposits],
        });
      } else {
        setTokenGraphValues({
          labels: ["Total Tokens Issued", "Sales"],
          values: [
            kpis.tokens,
            Object.values(events || {})
              .flatMap((entry: any) => {
                if (!entry?.data || !Array.isArray(entry.data)) return [];
                return entry.data.filter((x: TokenEvent) => x.name === "Sales").map((x: TokenEvent) => x.value);
              })
              .reduce((acc: number, value: number) => acc + value, 0), // Calculate the total sum
          ],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const items = [
    {
      label: "Token Insights",
      key: "1",
      children: <BarChart data={getGraphData(tokenGraphValues)} title="Net Token Issued & Redeemed" />,
    },
    {
      label: "Token Insights (Stocks)",
      key: "2",
      children: <BarChart data={getGraphData(stocksGraphValues)} title="Total Stocks Outstanding & Retired" />,
    },
    {
      label: "Stock Insights",
      key: "3",
      children: <BarChart data={getGraphData(stocksValueGraphValues)} title="Stock Values" />,
    },
  ];

  return (
    <div className="w-full flex gap-3">
      {" "}
      {/* Flex container for layout control */}
      <div className="lg:col-span-3 flex flex-col gap-3 flex-grow">
        {" "}
        {/* Chart container */}
        <div className="flex lg:grid grid-cols-4 gap-3 pb-3 flex-wrap">
          {getKPIs(kpisData)?.map((kpi) => <KPI key={kpi.title} icon={kpi.icon} title={kpi.title} value={kpi.value} />)}
        </div>
        <Card className="w-full flex-grow no-padding bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
          <Tabs items={items}></Tabs>
        </Card>
      </div>
      <Card className="lg:h-auto max-h-[100vh] lg:max-w-sm overflow-y-auto border-nomyx-gray4-light dark:border-nomyx-gray4-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark flex-grow">
        {" "}
        {/* Event feed container */}
        <EventFeed data={eventDetails} />
      </Card>
    </div>
  );
}

Home.getLayout = getDashboardLayout;
