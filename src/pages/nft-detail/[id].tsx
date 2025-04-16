import React, { useEffect, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { getDashboardLayout } from "@/Layouts";
import { CustomerService } from "@/services/CustomerService";

import NftRecordDetail from "../../components/mint/NftRecordDetail";

type NftDataType = {
  [key: string]: string | string[];
};

export default function NftDetail() {
  const router = useRouter();
  const [nftData, setNftData] = useState<NftDataType | null>(null);
  const id = router.query.id as string | undefined;

  useEffect(() => {
    if (!id) return;

    const getData = async () => {
      try {
        const api = CustomerService(); // Called inside useEffect to avoid stale memo
        const nft = await api.getMintedNftDetails(id);
        if (nft) {
          // Remove objectId from the returned data
          const { objectId, ...sanitized } = nft;
          setNftData(sanitized);
        } else {
          console.warn("No NFT found with id:", id);
        }
      } catch (error) {
        console.error("Error fetching NFT details:", error);
      }
    };

    getData();
  }, [id]);

  return (
    <>
      <Head>
        <title>NFT Details - Nomyx Mintify</title>
      </Head>
      <div className="grid gap-3">
        {nftData ? <NftRecordDetail detailView={true} data={nftData} /> : <div className="text-center text-gray-500">Loading NFT details...</div>}
      </div>
    </>
  );
}

NftDetail.getLayout = getDashboardLayout;
