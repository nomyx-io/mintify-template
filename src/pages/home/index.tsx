"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Card, Tabs, Spin, Alert } from "antd";
import Head from "next/head";

import BarChart from "@/components/atoms/Graphs/Barchart";
import KPI from "@/components/atoms/KPI";
import { EventFeed } from "@/components/molecules/EventFeed";
import { getDashboardLayout } from "@/Layouts";
import { CustomerService } from "@/services/CustomerService";
import { KPIs } from "@/types/kpis";
import { getGraphData, getKPIs } from "@/utils/dashboard";

// Define necessary interfaces
interface TokenEvent {
  name: string;
  value: number;
}

interface Events {
  [key: string]: {
    data: TokenEvent[];
    [key: string]: any;
  };
}

interface GraphValues {
  labels: string[];
  values: number[];
}

interface PoolStats {
  activePools: number;
  retiredPools: number;
}

export default function Home() {
  const api = useMemo(() => CustomerService(), []);
  const [tokenGraphValues, setTokenGraphValues] = useState<GraphValues | undefined>();
  const [stocksGraphValues, setStocksGraphValues] = useState<GraphValues | undefined>();
  const [stocksValueGraphValues, setStocksValueGraphValues] = useState<GraphValues | undefined>();
  const [poolGraphValues, setPoolGraphValues] = useState<GraphValues | undefined>();
  const [carbonGraphValues, setCarbonGraphValues] = useState<GraphValues | undefined>();
  const [eventDetails, setEventDetails] = useState<Events>({});
  const [kpisData, setkpisData] = useState<KPIs | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  // Check if session token exists and is accessible
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("sessionToken");
      console.log("Dashboard Session Check - Token exists:", !!token);
      setSessionChecked(true);
    };

    checkSession();
  }, []);

  const fetchData = useCallback(async () => {
    // Don't try to fetch data until we've checked for session token
    if (!sessionChecked) return;

    setLoading(true);
    setError(null);

    console.log("Dashboard - Fetching data attempt:", retryCount + 1);

    try {
      // Add a small delay before fetching data to ensure authentication is fully processed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use Promise.all for parallel data fetching with explicit error handling
      const results = await Promise.allSettled([api.getEvents(), api.getKpis(), api.getPoolStats()]);

      // Check if any promises were rejected
      const errors = results.filter((result) => result.status === "rejected");
      if (errors.length > 0) {
        console.error("Errors fetching dashboard data:", errors);
        throw new Error("Failed to fetch some dashboard data");
      }

      // Extract the values safely
      const [eventsResult, kpisResult, poolStatsResult] = results;
      const events = eventsResult.status === "fulfilled" ? eventsResult.value : {};
      const kpis = kpisResult.status === "fulfilled" ? kpisResult.value : undefined;
      const poolStats = poolStatsResult.status === "fulfilled" ? poolStatsResult.value : { activePools: 0, retiredPools: 0 };

      // Update state with the fetched data, with checks for undefined values
      if (kpis) {
        setkpisData(kpis);
      }

      // Ensure events data is properly formatted for EventFeed
      const formattedEvents = Object.entries(events || {}).reduce((acc, [key, event]) => {
        return {
          ...acc,
          [key]: {
            ...event,
            // Ensure data is always an array
            data: Array.isArray(event.data) ? event.data : [],
          },
        };
      }, {});

      setEventDetails(formattedEvents);

      // Set stocks graph data if we have the required values
      if (kpis?.activeTokens !== undefined && kpis?.retiredTokens !== undefined) {
        setStocksGraphValues({
          labels: ["Total Stocks Outstanding", "Total Stocks Retired"],
          values: [kpis.activeTokens, kpis.retiredTokens],
        });
      }

      // Set stocks value graph data - handle string parsing safely
      if (kpis?.activeTokenizedValue && kpis?.totalRetiredAmount) {
        const activeValue = parseFloat(kpis.activeTokenizedValue.replace(/[^0-9.-]+/g, "") || "0");
        const retiredValue = parseFloat(kpis.totalRetiredAmount.replace(/[^0-9.-]+/g, "") || "0");

        setStocksValueGraphValues({
          labels: ["Total Stocks Outstanding ($)", "Total Stocks Paid-off ($)"],
          values: [isNaN(activeValue) ? 0 : activeValue, isNaN(retiredValue) ? 0 : retiredValue],
        });
      }

      // Set pool graph data
      if (poolStats && poolStats.activePools !== undefined && poolStats.retiredPools !== undefined) {
        setPoolGraphValues({
          labels: ["Total Pools Active", "Total Pools Retired"],
          values: [poolStats.activePools, poolStats.retiredPools],
        });
      }

      // Set token graph values based on available data
      if (kpis?.tokens !== undefined) {
        if (kpis?.totalDeposits > 0) {
          setTokenGraphValues({
            labels: ["Total Tokens Issued", "Total Deposits"],
            values: [kpis.tokens, kpis.totalDeposits],
          });
        } else {
          // Safely calculate sales from events
          const totalSales = Object.values(events || {})
            .flatMap((entry: any) => {
              if (!entry?.data || !Array.isArray(entry.data)) return [];
              return entry.data.filter((x: TokenEvent) => x.name === "Sales").map((x: TokenEvent) => x.value || 0);
            })
            .reduce((acc: number, value: number) => acc + value, 0);

          setTokenGraphValues({
            labels: ["Total Tokens Issued", "Sales"],
            values: [kpis.tokens, totalSales],
          });
        }
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setError("Failed to load dashboard data. Please check your connection and try again.");

      // Retry logic - attempt to fetch data again after a delay if we haven't exceeded max retries
      if (retryCount < 3) {
        setTimeout(
          () => {
            setRetryCount((prevCount) => prevCount + 1);
          },
          2000 * Math.pow(2, retryCount)
        ); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [api, retryCount, sessionChecked]);

  // Fetch data when component mounts or when retryCount changes
  useEffect(() => {
    if (sessionChecked) {
      fetchData();
    }
  }, [fetchData, retryCount, sessionChecked]);

  // Define tab items with safe access to graph data
  const items = useMemo(
    () => [
      {
        label: "Token Insights",
        key: "1",
        children:
          tokenGraphValues && tokenGraphValues.values.some((value) => value > 0) ? (
            <BarChart data={getGraphData(tokenGraphValues)} title="Net Token Issued & Redeemed" />
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No Data Available</div>
          ),
      },
      {
        label: "Token Insights (Stocks)",
        key: "2",
        children:
          stocksGraphValues && stocksGraphValues.values.some((value) => value > 0) ? (
            <BarChart data={getGraphData(stocksGraphValues)} title="Total Stocks Outstanding & Retired" />
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No Data Available</div>
          ),
      },
      {
        label: "Stock Insights",
        key: "3",
        children:
          stocksValueGraphValues && stocksValueGraphValues.values.some((value) => value > 0) ? (
            <BarChart data={getGraphData(stocksValueGraphValues)} title="Stock Values" />
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No Data Available</div>
          ),
      },
      {
        label: "Pool Insights",
        key: "4",
        children:
          poolGraphValues && poolGraphValues.values.some((value) => value > 0) ? (
            <BarChart data={getGraphData(poolGraphValues)} title="Pool Statistics" />
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No Data Available</div>
          ),
      },
    ],
    [tokenGraphValues, stocksGraphValues, stocksValueGraphValues, poolGraphValues]
  );

  // Manual refresh function
  const handleRefresh = () => {
    setRetryCount((prevCount) => prevCount + 1);
  };

  return (
    <>
      <Head>
        <title>Dashboard - Nomyx Mintify</title>
      </Head>

      <div className="flex flex-col lg:flex-row gap-3 w-full">
        {/* Main dashboard section */}
        <div className="flex flex-col gap-3 flex-grow">
          {/* Error message */}
          {error && (
            <Alert
              message="Error Loading Dashboard"
              description={
                <div>
                  {error}
                  <button onClick={handleRefresh} className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                    Retry
                  </button>
                </div>
              }
              type="error"
              showIcon
              closable
            />
          )}

          {/* KPI cards */}
          <div className="flex flex-col gap-3">
            {loading ? (
              // Show loading skeleton for KPIs
              <div className="flex flex-wrap w-full -mx-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="px-2 w-full sm:w-1/2 lg:w-1/4">
                    <Card className="h-24 animate-pulse bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="w-full text-center py-4">Unable to load KPI data</div>
            ) : (
              <div className="flex flex-wrap w-full -mx-1 gap-y-4">
                {getKPIs(kpisData)?.map((kpi) => (
                  <div
                    key={kpi.title}
                    className={`px-2 ${
                      getKPIs(kpisData)?.length === 1
                        ? "w-full"
                        : getKPIs(kpisData)?.length === 2
                          ? "w-1/2"
                          : getKPIs(kpisData)?.length === 3
                            ? "w-1/3"
                            : getKPIs(kpisData)?.length === 4
                              ? "w-1/4"
                              : getKPIs(kpisData)?.length === 5
                                ? "w-1/5"
                                : "min-w-[250px] flex-grow"
                    }`}
                  >
                    <KPI icon={kpi.icon} title={kpi.title} value={kpi.value} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart section */}
          <Card className="w-full flex-grow p-0 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">Error loading charts</div>
            ) : (
              <Tabs items={items} />
            )}
          </Card>
        </div>

        {/* Sidebar: Event Feed */}
        <Card className="w-full lg:w-[600px] max-h-[110vh] overflow-y-auto border-nomyx-gray4-light dark:border-nomyx-gray4-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin />
            </div>
          ) : (
            <EventFeed data={Object.keys(eventDetails).length > 0 ? eventDetails : {}} />
          )}
        </Card>
      </div>
    </>
  );
}

Home.getLayout = getDashboardLayout;
