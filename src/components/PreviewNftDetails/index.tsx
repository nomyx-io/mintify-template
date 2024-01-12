import { Button } from '../../material-tailwind'
import React from 'react'
import ImageComp from '.././molecules/ImageBox'
import Previewdetailcards from '.././molecules/PreviewDetailCards'
import Previewbottomcards from '.././molecules/PreviewBottomCards'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { LeftArrowIcon, ShareIcon } from '@/assets'

const PreviewNftDetails = ({ id, TablesData = [], handleMint, handleBack, data, detailView = false }: any) => {
    const router = useRouter()
    const { nftTitle, txHash, defaultTokenImageUrl } = data;

    return (
        <div className='p-4 my-2 w-full flex flex-col gap-4'>
            {detailView && <p className='flex items-center justify-between -ml-4 p-0 cursor-pointer' onClick={() => router.back()}>
                <div className='flex items-center gap-1'> <LeftArrowIcon /> <p>Back</p> </div>
                <Button size='sm' onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash ? txHash : ''}`)} className='flex items-center gap-2'><ShareIcon /> Preview Link</Button>
            </p>}
            <p className='text-lg font-semibold'>{detailView ? `Detail View NBT - ${id}` : 'Preview NBT'}</p>
            <div className='flex gap-4'>
                <div className='flex flex-col flex-grow h-max gap-10 max-w-[68%]'>
                    <div>
                        {nftTitle}
                    </div>
                    <Previewdetailcards data={data} />
                </div>
                <div className='w-[30%] flex flex-col gap-4'>
                    {!detailView &&
                    <>
                    <Button onClick={handleBack} className='bg-[#dedede] text-black rounded-none'>Back</Button>
                    <Button onClick={handleMint} className='bg-[#637eab] rounded-none'>Mint</Button>
                    </>

}
                    <img src={defaultTokenImageUrl} />
                </div>
            </div>
            {detailView &&
                <Previewbottomcards TablesData={TablesData} />}
        </div>
    )
}

export default PreviewNftDetails
