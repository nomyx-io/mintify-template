import React, { useEffect, useMemo, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { getDashboardLayout } from "@/Layouts";
import { CustomerService } from "@/services/CustomerService";

import NftRecordDetail from "../../components/mint/NftRecordDetail";

export default function NftDetail() {
  const router = useRouter();
  const api = useMemo(() => CustomerService(), []);
  const [nftData, setNftData] = useState();

  const id = router.query.id;

  useEffect(() => {
    const getData = async () => {
      let nft = await api.getMintedNftDetails(id as string);
      setNftData({ ...nft, id: id });
    };

    if (id) {
      getData();
    }
  }, [api, id]);

  return (
    <>
      <Head>
        <title>Mintify - NFT Details</title>
      </Head>
      <div className="grid gap-3">{nftData && <NftRecordDetail detailView data={nftData} />}</div>
    </>
  );
}
NftDetail.getLayout = getDashboardLayout;
