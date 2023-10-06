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
        <div className='p-4 my-2 w-full flex flex-col gap-12'>
            <p className='text-lg font-semibold'>Preview NFT</p>
            <div className='flex gap-4'>
                <div className='flex flex-col flex-grow h-20 gap-10 max-w-[68%]'>
                    <div>
                        <p className='text-[#2781e7]'>LenderLab Note-Backend Token v1</p>
                        <p>NBT #001, 800+ FICO </p>
                        <p className='text-[#4e514e]'>Owned by Central Authority</p>
                    </div>
                    <Previewdetailcards />
                </div>
                <div className='w-[30%] flex flex-col gap-4'>
                    <Button onClick={handleBack} className='bg-[#dedede] text-black rounded-none'>Back</Button>
                    <Button onClick={handleMint} className='bg-[#637eab] rounded-none'>Mint</Button>
                    <ImageComp previewPage file={data.file} />
                </div>
            </div>
            <Previewbottomcards />
        </div>
    )
}

export default PreviewNftDetails