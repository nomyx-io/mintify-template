import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '@/Layouts'
import { useSearchParams } from 'next/navigation'
import { ApiHook } from '@/services/api'
import PreviewNftDetails from '@/components/PreviewNftDetails'

export default function DetailView ({ handleBack, data }: any) {
    const api = ApiHook()
    const pathName = useSearchParams()
    const [nftData, setNftData] = useState()
    useEffect(() => {
        const getData = async () => {
            const id = pathName.get('id')
            let nft = await api.getMintedNftDetails(id)
            nft = nft[0].attributes.attributes
            let resultObject: any = {};
            for (const [key, , value] of nft) {
                resultObject[key] = value;
            }
            setNftData(resultObject)
        }
        getData()
    }, [pathName])
    return (
        nftData && <PreviewNftDetails detailView data={nftData} />
    )
}
DetailView.getLayout = getDashboardLayout;
