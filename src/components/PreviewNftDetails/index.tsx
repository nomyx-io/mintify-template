import { Button } from '../../material-tailwind'
import React from 'react'
import ImageComp from '.././molecules/ImageBox'
import Previewdetailcards from '.././molecules/PreviewDetailCards'
import Previewbottomcards from '.././molecules/PreviewBottomCards'

const PreviewNftDetails = ({ handleBack, data }: any) => {
    const handleMint = () => {
        console.log("Mint Clicked")
    }
    return (
        <div className='p-4 my-2 w-full flex flex-col gap-4'>
            <p className='text-lg font-semibold'>Preview NFT</p>
            <div className='flex gap-4'>
                <div className='flex flex-col flex-grow h-20 gap-10 max-w-[68%]'>
                    <div>
                        {data?.nftTitle || ""}
                    </div>
                    <Previewdetailcards data={data} />
                </div>
                <div className='w-[30%] flex flex-col gap-4 my-16'>
                    <ImageComp previewPage file={data?.image || ""} />
                </div>
            </div>
            <Previewbottomcards />
        </div>
    )
}

export default PreviewNftDetails