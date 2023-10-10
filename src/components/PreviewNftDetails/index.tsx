import { Button } from '../../material-tailwind'
import React from 'react'
import ImageComp from '.././molecules/ImageBox'
import Previewdetailcards from '.././molecules/PreviewDetailCards'
import Previewbottomcards from '.././molecules/PreviewBottomCards'
import { toast } from 'react-toastify'

const PreviewNftDetails = ({ service, handleBack, data }: any) => {
    const { nftTitle, description, ficoScore, file, loanId, loanAmount, mintAddress, monthly, discount, location, price, targetKeys, term, yields } = data
    const metadata = [
        {
            key: "nftTitle",
            attributeType: 1,
            value: nftTitle,
        },
        {
            key: "description",
            attributeType: 1,
            value: description,
        },
        {
            key: "loanId",
            attributeType: 1,
            value: loanId,
        },
        {
            key: "loanAmount",
            attributeType: 1,
            value: loanAmount,
        },

        {
            key: "term",
            attributeType: 1,
            value: term,
        },

        {
            key: "ficoScore",
            attributeType: 1,
            value: ficoScore,
        },
        {
            key: "monthly",
            attributeType: 1,
            value: monthly,
        },
        {
            key: "discount",
            attributeType: 1,
            value: discount,
        },
        {
            key: "location",
            attributeType: 1,
            value: location,
        },
        {
            key: "price",
            attributeType: 1,
            value: price,
        },
        {
            key: "Image",
            attributeType: 1,
            value: file,
        },
        {
            key: "yield",
            attributeType: 1,
            value: yields,
        },
        {
            key: "claimTopics",
            attributeType: 0,
            value: targetKeys.join(','),
        },
        {
            key: "mintAddress",
            attributeType: 1,
            value: mintAddress,
        }
    ];
    const handleMint = async () => {
        try {
            const result = await service.llmint(metadata)
            toast.success(`Nft Minted to ${mintAddress}  !`)

        } catch (error) {
            console.log(error, "error >>")
        }
    }
    return (
        <div className='p-4 my-2 w-full flex flex-col gap-4'>
            <p className='text-lg font-semibold'>Preview NFT</p>
            <div className='flex gap-4'>
                <div className='flex flex-col flex-grow h-20 gap-10 max-w-[68%]'>
                    <div>
                        {nftTitle}
                    </div>
                    <Previewdetailcards data={data} />
                </div>
                <div className='w-[30%] flex flex-col gap-4'>
                    <Button onClick={handleBack} className='bg-[#dedede] text-black rounded-none'>Back</Button>
                    <Button onClick={handleMint} className='bg-[#637eab] rounded-none'>Mint</Button>
                    <ImageComp previewPage file={data.file} />
                </div>
            </div>
        </div>
    )
}

export default PreviewNftDetails