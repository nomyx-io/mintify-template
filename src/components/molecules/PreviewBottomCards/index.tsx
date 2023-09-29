import Image from 'next/image'
import React from 'react'

const Previewbottomcards = () => {
  return (
    <div className='w-full flex flex-col gap-4'>
    <div>
        <p className='p-2 border border-[#c0c0c0] rounded flex gap-1'>
            <Image alt="" src={require('../../../assets/priceHistoryIcon.png')} />
            Price History</p>
        <div className='border border-[#c0c0c0] p-8 flex flex-col gap-2 justify-center items-center text-center'>
            <Image alt="" src={require('../../../assets/clock.png')} />
            No events have occured yet <br /> Check back later
        </div>
    </div>
    <div>
        <p className='p-2 border border-[#c0c0c0] rounded flex gap-1'>
            <Image alt="" src={require('../../../assets/listingIcon.png')} />
            Listings</p>
        <div className='border border-[#c0c0c0] p-8 flex flex-col gap-2 justify-center items-center text-center'>
            <Image alt="" src={require('../../../assets/clock.png')} />
            No events have occured yet <br /> Check back later
        </div>
    </div>
    <div>
        <p className='p-2 border border-[#c0c0c0] rounded flex gap-1'>
            <Image alt="" src={require('../../../assets/offerIcon.png')} height={10} width={20} />
            Offers
        </p>
        <div className='border border-[#c0c0c0] p-8 flex flex-col gap-2 justify-center items-center text-center'>
            <Image alt="" src={require('../../../assets/offers.png')} />
            No offers yet
        </div>
    </div>
</div>
  )
}

export default Previewbottomcards