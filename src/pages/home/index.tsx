"use client";
import KPI from "@/components/atoms/KPI";
import { KronosService } from "@/services/KronosService";
import { EventFeed } from "@/components/molecules/EventFeed";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardLayout } from "@/Layouts";
import BarChart from "@/components/atoms/Graphs/Barchart";
import { Card, Tabs } from "antd";
import { getGraphData, getKPIs } from "@/utils/dashboard";

export default function Home() {
  const api = useMemo(() => KronosService(), []);
  const [tokenGraphValues, setTokenGraphValues] = useState<GraphValues>();
  const [carbonGraphValues, setCarbonGraphValues] = useState<GraphValues>();
  const [eventDetails, setEventDetails] = useState<Events>({});
  const [kpisData, setkpisData] = useState<KPIs>();

  const fetchData = useCallback(async () => {
    try {
      const [events, kpis] = await Promise.all([
        api.getEvents(),
        api.getKpis(),
      ]);

      setTokenGraphValues({
        labels: ["Total Tokens Issued", "Total Tokens Retired"],
        values: [kpis.tokens, kpis.retired],
      });
      setCarbonGraphValues({
        labels: ["Total Carbon Issued", "Total Carbon Retired"],
        values: [kpis.carbonIssued, kpis.carbonRetired],
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
      children: (
        <BarChart
          data={getGraphData(tokenGraphValues)}
          title="Net Token Issued & Redeemed"
        />
      ),
    },
    {
      label: "Carbon Insights",
      key: "2",
      children: (
        <BarChart
          data={getGraphData(carbonGraphValues)}
          title="Net Carbon Issued & Redeemed"
        />
      ),
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-3 h-[100%]">
      <div className="lg:col-span-3 flex flex-col left">
        <div className="flex lg:grid grid-cols-3 gap-3 pb-3 flex-wrap">
          {getKPIs(kpisData)?.map((kpi) => (
            <KPI
              key={kpi.title}
              icon={kpi.icon}
              title={kpi.title}
              value={kpi.value}
            />
          ))}
        </div>
        <Card className="w-full flex-grow no-padding bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark flex-1">
          <Tabs items={items}></Tabs>
        </Card>
      </div>
      <Card className="no-padding h-full overflow-y-auto border-nomyx-gray4-light dark:border-nomyx-gray4-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark right">
        <EventFeed data={eventDetails} />
      </Card>
    </div>
  );
}

Home.getLayout = getDashboardLayout;
