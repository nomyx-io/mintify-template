import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '@/Layouts'
import { useSearchParams } from 'next/navigation'
import { ApiHook } from '@/services/api'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import MockImage from '../../assets/loginimg.png'

export default function DetailView () {
    const api = ApiHook()
    const pathName = useSearchParams()
    const [nftData, setNftData] = useState()
    const [tablesData, setTablesData] = useState<any>([])

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

    useEffect(() => {
        const getData = async () => {
            const id = pathName.get('id')
            let nft = await api.getMintedNftDetails(id)
            nft = nft && nft[0]?.attributes?.attributes
            let resultObject: any = {};
            if (nft) {
                for (const [key, , value] of Object(nft)) {
                    resultObject[key] = value;
                }
                resultObject.file = MockImage
                setNftData(resultObject)
            }
        }
        getData()
    }, [pathName])

    let newTokenData: any = []
    let newDepositData: any = []
    let newClaimData: any = []
    let newListData: any = []
    useEffect(() => {
        const getNewData = async () => {
        const id = pathName.get('id')
        let tokenId = await api.getMintedNftDetails(id)
        tokenId = tokenId && tokenId[0]?.attributes?.tokenId
        let depositData: any = await api.getDeposits(tokenId)
        depositData.map((item: any)=>{newDepositData.push(item.attributes)})
        let claimData: any = await api.getTreasuryClaims(tokenId)
        claimData.map((item: any)=>{newClaimData.push(item.attributes)})
        let listingData: any = await api.getListings(tokenId)
        listingData.map((item: any)=>{newListData.push(item.attributes)})
        let tokenSaleData: any = await api.getSaleTokens(tokenId)
        tokenSaleData.map((item: any)=>{newTokenData.push(item.attributes)})
        let TablesData = [
            {columns: tokenSaleColumns, tableData: newTokenData,label: 'Token Sale', headerImage: require('../../assets/priceHistoryIcon.png'),noDataImage: require('../../assets/clock.png'),noDataText: 'No Data'},
            {columns: listingColumns, tableData: newListData,label: 'Listing', headerImage: require('../../assets/listingIcon.png'), noDataImage: require('../../assets/clock.png'),noDataText: 'No Data'},
            {columns: depositColumns, tableData: newDepositData, label: 'Deposit',headerImage: require('../../assets/offerIcon.png'), noDataImage: require('../../assets/offerIcon.png'),noDataText: 'No Data'},
            {columns: claimColumns, tableData: newClaimData, label: 'Claim', headerImage: require('../../assets/offerIcon.png'), noDataImage: require('../../assets/offerIcon.png'),noDataText: 'No Data'},
        ]
        setTablesData(TablesData)
        }
        getNewData()
      }, [])

    return (
        nftData && <PreviewNftDetails TablesData={tablesData} detailView data={nftData} />
    )
}
DetailView.getLayout = getDashboardLayout;
