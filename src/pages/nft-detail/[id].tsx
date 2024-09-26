import React, {useEffect, useState} from 'react'
import {getDashboardLayout} from '@/Layouts'
import {KronosService} from '@/services/KronosService'
import NftRecordDetail from '../../components/NftRecordDetail'
import {useRouter} from 'next/router'
import moment from 'moment'
import {MoneyCollectOutlined} from "@ant-design/icons";
import KronosSpin from "@/components/KronosSpin";

export default function NftDetail() {
    const router = useRouter()
    const api = KronosService()
    const [nftData, setNftData] = useState()
    const [tablesData, setTablesData] = useState<TableData[]>([])
    const [loading, setLoading] = useState(false)

    const depositColumns = [
        {dataIndex: ['deposit', 'objectId'], title: 'Deposit', sortable: true},
        // {dataIndex: 'depositDate', title: 'Deposit Date'},
        {dataIndex: 'createdAt', title: 'Created Date'},
        {dataIndex: 'amount', title: 'Amount', align: 'right', sortable: true}
    ];

    const claimColumns = [
        {dataIndex: 'tokenId', title: 'Token Id', align: 'center', sortable: true},
        {dataIndex: 'claimAmount', title: 'Claim Amount', align: 'center', sortable: true},
        {dataIndex: 'createdAt', title: 'Created Date', align: 'center'},
    ]

    const listingColumns = [
        {dataIndex: 'tokenId', title: 'Token Id', align: 'center', sortable: true},
        {dataIndex: 'listPrice', title: 'List Price', align: 'center', sortable: true},
        {dataIndex: 'createdAt', title: 'Created Date', align: 'center'},
        {dataIndex: 'active', title: 'Active', align: 'center',},
    ]

    const tokenSaleColumns = [
        {dataIndex: 'tokenId', title: 'Token Id', align: 'center', sortable: true},
        {dataIndex: 'salePrice', title: 'Sale Price', align: 'center', sortable: true},
        {dataIndex: 'createdAt', title: 'Created Date', align: 'center'},
        {dataIndex: 'listingId', title: 'Listing ID', align: 'center'},
    ]
    const id = router.query.id;

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            let nft = await api.getMintedNftDetails(id);
            setNftData(nft);
            setLoading(false);
        }
        getData();
    }, [])

    let newTokenData: DataSource[] = []
    let newClaimData: DataSource[] = []
    let newListData: DataSource[] = []
    useEffect(() => {

        // debugger;
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
                    columns: tokenSaleColumns,
                    tableData: newTokenData,
                    label: 'Sales',
                    headerImage: require('../../assets/priceHistoryIcon.png')
                },
                {
                    columns: listingColumns,
                    tableData: newListData,
                    label: 'Listings',
                    headerImage: require('../../assets/listingIcon.png')
                },
                {
                    columns: depositColumns,
                    tableData: tokenDepositData,
                    label: 'Deposits',
                    headerImage: (<MoneyCollectOutlined/>)
                },
                {
                    columns: claimColumns,
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
