import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '@/Layouts'
import { useSearchParams } from 'next/navigation'
import { ApiHook } from '@/services/api'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import MockImage from '../../assets/loginimg.png'
import { useRouter } from 'next/router'
import { Spin } from 'antd'
import moment from 'moment'

export default function DetailViewId () {
    const router = useRouter()
    const api = ApiHook()
    const [nftData, setNftData] = useState()
    const [tablesData, setTablesData] = useState<any>([])
    const [loading, setLoading] = useState(false)

    const depositColumns = [
        { key: 'tokenId', label: 'Token Id', align: 'center', sortable: true },
        { key: 'depositAmount', label: 'Deposit Amount', align: 'center', sortable: true },
        { key: 'createdDate', label: 'Created Date', align: 'center' },
        { key: 'depositDate', label: 'Deposit Date', align: 'center' },
      ];

    const claimColumns = [
        { key: 'tokenId', label: 'Token Id', align: 'center', sortable: true },
        { key: 'claimAmount', label: 'Claim Amount', align: 'center', sortable: true },
        { key: 'createdDate', label: 'Created Date', align: 'center' },
    ]

    const listingColumns = [
        { key: 'tokenId', label: 'Token Id', align: 'center', sortable: true },
        { key: 'listPrice', label: 'List Price', align: 'center', sortable: true },
        { key: 'createdDate', label: 'Created Date', align: 'center' },
        { key: 'active', label: 'Active', align: 'center', },
    ]

    const tokenSaleColumns = [
        { key: 'tokenId', label: 'Token Id', align: 'center', sortable: true },
        { key: 'salePrice', label: 'Sale Price', align: 'center', sortable: true },
        { key: 'createdDate', label: 'Created Date', align: 'center' },
        { key: 'listingId', label: 'Listing ID', align: 'center' },
    ]
    const id = router.query.id
    useEffect(() => {
        const getData = async () => {
            setLoading(true)
            let nft = await api.getMintedNftDetails(id)
            const transactionHash = nft && nft[0]?.attributes?.transactionHash
            nft = nft && nft[0]?.attributes?.attributes
            let resultObject: any = {};
            if (nft) {
                for (const [key, , value] of Object(nft)) {
                    resultObject[key] = value;
                }
                resultObject.file = MockImage
                resultObject.txHash = transactionHash
                setNftData(resultObject)
            }
            setLoading(false)
        }
        getData()
    }, [])

    let newTokenData: any = []
    let newDepositData: any = []
    let newClaimData: any = []
    let newListData: any = []
    useEffect(() => {
        const getNewData = async () => {
        let tokenId = await api.getMintedNftDetails(id)
        tokenId = tokenId && tokenId[0]?.attributes?.tokenId
        let depositData: any = await api.getDeposits(tokenId)
        depositData.map((item: any)=>{newDepositData.push({...item.attributes,"createdDate":moment(item?.attributes?.createdDate).format('YYYY-MM-DD'), 'depositDate':moment(item?.attributes?.depositDate).format('YYYY-MM-DD') })})
        let claimData: any = await api.getTreasuryClaims(tokenId)
        claimData.map((item: any)=>{newClaimData.push({...item.attributes,"createdDate":moment(item?.attributes?.createdDate).format('YYYY-MM-DD')})})
        let listingData: any = await api.getListings(tokenId)
        listingData.map((item: any)=>{newListData.push({...item.attributes,"createdDate":moment(item?.attributes?.createdDate).format('YYYY-MM-DD'), active: JSON.stringify(item?.attributes?.active)})})
        let tokenSaleData: any = await api.getSaleTokens(tokenId)
        tokenSaleData.map((item: any)=>{newTokenData.push({...item.attributes,"createdDate":moment(item?.attributes?.createdDate).format('YYYY-MM-DD')})})
        let TablesData = [
            {columns: tokenSaleColumns, tableData: newTokenData,label: 'Token Sale', headerImage: require('../../assets/priceHistoryIcon.png'),noDataImage: require('../../assets/clock.png')},
            {columns: listingColumns, tableData: newListData,label: 'Listing', headerImage: require('../../assets/listingIcon.png'), noDataImage: require('../../assets/clock.png')},
            {columns: depositColumns, tableData: newDepositData, label: 'Deposit',headerImage: require('../../assets/offerIcon.png'), noDataImage: require('../../assets/offerIcon.png')},
            {columns: claimColumns, tableData: newClaimData, label: 'Claim', headerImage: require('../../assets/offerIcon.png'), noDataImage: require('../../assets/offerIcon.png')},
        ]
        setTablesData(TablesData)
        }
        getNewData()
      }, [])
      
    return (
        <div>
            {loading ? <div className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]'>
                <Spin />
            </div> :
            nftData && <PreviewNftDetails id={id} TablesData={tablesData} detailView data={nftData} />}
        </div>
    )
}
DetailViewId.getLayout = getDashboardLayout;
