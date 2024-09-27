import React, {useEffect, useState} from 'react'
import {getDashboardLayout} from '@/Layouts'
import {KronosService} from '@/services/KronosService'
import NftRecordDetail from '../../components/NftRecordDetail'
import {useRouter} from 'next/router'
import moment from 'moment'
import {MoneyCollectOutlined} from "@ant-design/icons";
import KronosSpin from "@/components/KronosSpin";
import { NFT_DETAIL_COLUMNS } from '@/utils/constants'

export default function NftDetail() {
    const router = useRouter()
    const api = KronosService()
    const [nftData, setNftData] = useState()
    const [tablesData, setTablesData] = useState<TableData[]>([])
    const [loading, setLoading] = useState(false)

    const id = router.query.id;

    useEffect(() => {
      const getData = async () => {
          setLoading(true);
          let nft = await api.getMintedNftDetails(id);
          setNftData(nft);
          setLoading(false);
      }
      if (id) {
        getData();
      }
    }, [api, id])

    let newTokenData: DataSource[] = []
    let newClaimData: DataSource[] = []
    let newListData: DataSource[] = []
    useEffect(() => {
        const getNewData = async () => {
            let token = await api.getMintedNftDetails(id);

            const tokenDepositData = await api.getTokenDepositsForToken(id);
            const tokenId = token && token?.attributes?.tokenId;

            let claimData = await api.getTreasuryClaims(tokenId)
            claimData?.map((item) => {
                newClaimData.push({
                    id: item.id,
                    ...item.attributes,
                    createdAt: moment(item?.attributes?.createdAt).format('YYYY-MM-DD')
                })
            })
            let listingData = await api.getListings(tokenId)
            listingData?.map((item) => {
                newListData.push({
                    id: item.id,
                    ...item.attributes,
                    createdAt: moment(item?.attributes?.createdAt).format('YYYY-MM-DD'),
                })
            })
            let tokenSaleData = await api.getSaleTokens(tokenId)
            tokenSaleData?.map((item) => {
                newTokenData.push({
                    id: item.id,
                    ...item.attributes,
                    createdAt: moment(item?.attributes?.createdAt).format('YYYY-MM-DD')
                })
            })
            let TablesData: TableData[] = [
                {
                    columns: NFT_DETAIL_COLUMNS.tokenSaleColumns,
                    tableData: newTokenData,
                    label: 'Sales',
                    headerImage: require('../../assets/priceHistoryIcon.png')
                },
                {
                    columns: NFT_DETAIL_COLUMNS.listingColumns,
                    tableData: newListData,
                    label: 'Listings',
                    headerImage: require('../../assets/listingIcon.png')
                },
                {
                    columns: NFT_DETAIL_COLUMNS.depositColumns,
                    tableData: tokenDepositData,
                    label: 'Deposits',
                    headerImage: (<MoneyCollectOutlined/>)
                },
                {
                    columns: NFT_DETAIL_COLUMNS.claimColumns,
                    tableData: newClaimData,
                    label: 'Withdrawals',
                    headerImage: require('../../assets/offerIcon.png')
                },
            ]
            setTablesData(TablesData)
        }
        getNewData()
    }, []);


    return (
        <div className="grid gap-3">
            {loading ? <div
                    className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center'>
                    <KronosSpin/>
                </div> :
                nftData && <NftRecordDetail TablesData={tablesData} detailView data={nftData}/>}
        </div>
    )
}
NftDetail.getLayout = getDashboardLayout;
