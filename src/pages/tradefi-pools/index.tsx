import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "antd";
import { useRouter } from "next/router";

import { TelescopeIcon } from "@/assets";
import CreatePoolModal from "@/components/tradefi/CreatePoolModal";
import PoolCard from "@/components/tradefi/PoolCard";
import PoolDetails from "@/components/tradefi/PoolDetails";
import PoolListView from "@/components/tradefi/PoolListView";
import PoolsHeader from "@/components/tradefi/PoolsHeader";
import { getDashboardLayout } from "@/Layouts";
import { TradeFinanceService } from "@/services/TradeFinanceService";

export default function TradeFiPools() {
  const [open, setOpen] = useState(false);
  const [poolList, setPoolList] = useState<any[]>([]);

  const api = useMemo(() => TradeFinanceService(), []);

  const router = useRouter();
  const { query } = router;
  const queryString = (query?.query as string) || "";
  const viewMode = query?.viewMode || "card";
  const [selectedPool, setSelectedPool] = useState<any | null>(null);
  const filteredPools = poolList.filter(
    (pool) => pool.title.toLowerCase().includes(queryString?.toLowerCase()) || pool.description.toLowerCase().includes(queryString?.toLowerCase())
  );

  const handleCreatePool = () => {
    setOpen(true);
  };

  const fetchPools = useCallback(async () => {
    try {
      const pools = await api.getTradeFiPools();
      setPoolList(
        pools?.map((pool: any) => {
          return {
            id: pool.id,
            title: pool.attributes.title,
            description: pool.attributes.description,
            logo: pool.attributes.logo?._url || "",
            coverImage: pool.attributes.coverImage?._url || "",
            creditType: pool.attributes.creditType,
            totalUsdcDeposited: pool.attributes.totalUsdcDeposited || 0,
            totalInvoiceAmount: pool.attributes.totalInvoiceAmount || 0,
            totalInvoices: pool.attributes.totalInvoices || 0,
            usdcRemaining: pool.attributes.usdcRemaining || 0,
            maturityDate: pool.attributes.maturityDate,
          };
        }) || []
      );
    } catch (error) {
      console.error("Failed to fetch pools:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const onCreateSuccess = () => {
    fetchPools();
  };

  // Handle pool card or list item click
  const handlePoolClick = (pool: any) => {
    setSelectedPool(pool);
  };

  return (
    <>
      <CreatePoolModal open={open} setOpen={setOpen} onCreateSuccess={onCreateSuccess} />
      {!selectedPool && <PoolsHeader setOpen={setOpen} />}
      {selectedPool ? (
        // Render Pool Details
        <PoolDetails pool={selectedPool} onBack={() => setSelectedPool(null)} />
      ) : (
        <>
          {filteredPools.length > 0 ? (
            <>
              {viewMode === "table" && <PoolListView pools={filteredPools} className="mt-5" onPoolClick={handlePoolClick} />}
              {viewMode === "card" && (
                <div className="gap-5 grid grid-cols-2 xl:grid-cols-3 mt-5">
                  {filteredPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} onPoolClick={handlePoolClick} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col text-nomyx-text-light dark:text-nomyx-text-dark h-[80%] items-center justify-center w-full grow">
              <TelescopeIcon />
              <p>No Pools around here?</p>
              <p>Worry not! Let&apos;s create some</p>
              <br />
              <Button className="bg-[#3c89e8]" onClick={handleCreatePool}>
                Create New Pool
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

TradeFiPools.getLayout = getDashboardLayout;
