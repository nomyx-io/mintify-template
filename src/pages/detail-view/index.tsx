import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '@/Layouts'
import { useSearchParams } from 'next/navigation'
import { ApiHook } from '@/services/api'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import MockImage from '../../assets/loginimg.png'

export default function DetailView ({ handleBack, data }: any) {
    const api = ApiHook()
    const pathName = useSearchParams()
    const [nftData, setNftData] = useState()

    const depositData = [
        {
            depositDate: '10-9-2023', _createdAt: '10-9-2023', depositAmount: 9000, tokenId: 4
        }
    ]
    const claimData = [
        {
            _createdAt: '10-9-2023', claimAmount: 9000, tokenId: 4
        }
    ]
    const listingData = [
        {
            active: 'true', _createdAt: '10-9-2023', listPrice: 9000, tokenId: 4
        }
    ]
    const tokenSaleData = [
        {
            listtingId: 'nf273fd726', _createdAt: '10-9-2023', salePrice: 9000, tokenId: 4
        }
    ]

    const depositColumns = [
        { key: 'depositDate', label: 'Deposit Date', align: 'center' },
        { key: '_createdAt', label: 'Created Date', align: 'center' },
        { key: 'depositAmount', label: 'Deposit Amount', align: 'center', sortable: true },
        { key: 'tokenId', label: 'Token Id', align: 'right', sortable: true },
      ];

    const claimColumns = [
        { key: '_createdAt', label: 'Created Date', align: 'center' },
        { key: 'claimAmount', label: 'Claim Amount', align: 'center', sortable: true },
        { key: 'tokenId', label: 'Token Id', align: 'right', sortable: true },
    ]

    const listingColumns = [
        { key: 'active', label: 'Active', align: 'center' },
        { key: '_createdAt', label: 'Created Date', align: 'center' },
        { key: 'listPrice', label: 'List Price', align: 'center', sortable: true },
        { key: 'tokenId', label: 'Token Id', align: 'right', sortable: true },
    ]

    const tokenSaleColumns = [
        { key: 'listtingId', label: 'Listing ID', align: 'center' },
        { key: '_createdAt', label: 'Created Date', align: 'center' },
        { key: 'salePrice', label: 'Sale Price', align: 'center', sortable: true },
        { key: 'tokenId', label: 'Token Id', align: 'right', sortable: true },
    ]

    const TablesData = [
        {columns: tokenSaleColumns, tableData: tokenSaleData,label: 'Token Sale', headerImage: require('../../assets/priceHistoryIcon.png'),noDataImage: require('../../assets/clock.png'),noDataText: 'No Data'},
        {columns: listingColumns, tableData: listingData,label: 'Listing', headerImage: require('../../assets/listingIcon.png'), noDataImage: require('../../assets/clock.png'),noDataText: 'No Data'},
        {columns: depositColumns, tableData: depositData, label: 'Deposit',headerImage: require('../../assets/offerIcon.png'), noDataImage: require('../../assets/offerIcon.png'),noDataText: 'No Data'},
        {columns: claimColumns, tableData: claimData, label: 'Claim', headerImage: require('../../assets/offerIcon.png'), noDataImage: require('../../assets/offerIcon.png'),noDataText: 'No Data'},
    ]

    useEffect(() => {
        const getData = async () => {
            const id = pathName.get('id')
            let nft = await api.getMintedNftDetails(id)
            nft = nft[0]?.attributes?.attributes
            let resultObject: any = {};
            for (const [key, , value] of nft) {
                resultObject[key] = value;
            }
            resultObject.file = MockImage
            setNftData(resultObject)
        }
        getData()
    }, [pathName])
    return (
        nftData && <PreviewNftDetails TablesData={TablesData} detailView data={nftData} />
    )
}
DetailView.getLayout = getDashboardLayout;
