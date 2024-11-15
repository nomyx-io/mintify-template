"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Card, Tabs } from "antd";

import BarChart from "@/components/atoms/Graphs/Barchart";
import KPI from "@/components/atoms/KPI";
import { EventFeed } from "@/components/molecules/EventFeed";
import { getDashboardLayout } from "@/layouts";
import { CustomerService } from "@/services/CustomerService";
import { getGraphData, getKPIs } from "@/utils/dashboard";

export default function Home() {
  const api = useMemo(() => CustomerService(), []);
  const [tokenGraphValues, setTokenGraphValues] = useState<GraphValues>();
  const [carbonGraphValues, setCarbonGraphValues] = useState<GraphValues>();
  const [eventDetails, setEventDetails] = useState<Events>({});
  const [kpisData, setkpisData] = useState<KPIs>();

  const fetchData = useCallback(async () => {
    try {
      const [events, kpis] = await Promise.all([api.getEvents(), api.getKpis()]);

      setTokenGraphValues({
        labels: ["Total Tokens Issued", "Total Tokens Retired"],
        values: [kpis.tokens, 0],
      });
      setkpisData(kpis);
      setEventDetails(events || {});
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
  ];

  return (
    <div className="w-full flex gap-3">
      {" "}
      {/* Flex container for layout control */}
      <div className="lg:col-span-3 flex flex-col gap-3 flex-grow">
        {" "}
        {/* Chart container */}
        <div className="flex lg:grid grid-cols-2 gap-3 pb-3 flex-wrap">
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
