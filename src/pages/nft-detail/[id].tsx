import React, { useEffect, useMemo, useState } from 'react';
import { getDashboardLayout } from '@/Layouts';
import { KronosService } from '@/services/KronosService';
import NftRecordDetail from '../../components/NftRecordDetail';
import { useRouter } from 'next/router';
import BlockchainService from '@/services/BlockchainService';

export default function NftDetail({ service }: { service: BlockchainService }) {
  const router = useRouter();
  const api = useMemo(() => KronosService(), []);
  const [nftData, setNftData] = useState();

  const id = router.query.id;

  useEffect(() => {
    const getData = async () => {
      let nft = await api.getMintedNftDetails(id);
      const claims: Parse.Object[] | undefined =
        service && (await service.getClaimTopics());
      let allTopics: ClaimTopic[] = [];
      if (claims) {
        claims.forEach((item: Parse.Object) => {
          allTopics.push({
            key: `${parseInt(item.attributes.topic)}`,
            displayName: item.attributes.displayName as string,
            id: item.id as string,
            topic: item.attributes.topic as string,
          });
        });
      }
      setNftData({ ...nft, id: id, allTopics });
    };
    
    if (id) {
      getData();
    }
  }, [api, id, service]);

  

  return (
    <div className='grid gap-3'>
      {nftData && <NftRecordDetail detailView data={nftData} />}
    </div>
  );
}
NftDetail.getLayout = getDashboardLayout;
