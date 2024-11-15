import React, { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { getDashboardLayout } from "@/layouts";
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

  return <div className="grid gap-3">{nftData && <NftRecordDetail detailView data={nftData} />}</div>;
}
NftDetail.getLayout = getDashboardLayout;
