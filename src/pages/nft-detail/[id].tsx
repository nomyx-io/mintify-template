import React, { useEffect, useMemo, useState } from 'react';
import { getDashboardLayout } from '@/Layouts';
import { KronosService } from '@/services/KronosService';
import NftRecordDetail from '../../components/NftRecordDetail';
import { useRouter } from 'next/router';

export default function NftDetail() {
  const router = useRouter();
  const api = useMemo(() => KronosService(), []);
  const [nftData, setNftData] = useState();

  const id = router.query.id;

  useEffect(() => {
    const getData = async () => {
      let nft = await api.getMintedNftDetails(id);
      setNftData({ ...nft, id: id });
    };
    
    if (id) {
      getData();
    }
  }, [api, id]);

  

  return (
    <div className='grid gap-3'>
      {nftData && <NftRecordDetail detailView data={nftData} />}
    </div>
  );
}
NftDetail.getLayout = getDashboardLayout;
