import Image from 'next/image'
import React from 'react'
import Detailscard from '../../atoms/DetailsCard'

const Previewdetailcards = ({ data }: any) => {
    return (
        <div className='flex flex-col gap-4 border border-[#030303] rounded p-4 h-max'>
            <Detailscard
                image={<Image alt="" src={require('../../../assets/description.png')} />}
                label={'Description'}>
                {data?.description || ""}
            </Detailscard>
            <Detailscard
                image={<Image alt="" src={require('../../../assets/traitsIcon.png')} />}
                label={'Traits'}>
                <div className='flex gap-4 flex-wrap'>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Loan Id</div>
                            <div className='text-[#871212]'>#{data?.loanId || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Current Value</div>
                            <div className='text-[#871212]'>${data?.currentValue || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Origination amount</div>
                            <div className='text-[#871212]'>${data?.loanAmount || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Origination Date</div>
                            <div className='text-[#871212]'>{data?.originationDate || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Term</div>
                            <div className='text-[#871212]'>{data?.term || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Fico</div>
                            <div className='text-[#871212]'>{data?.ficoScore || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Interest rate</div>
                            <div className='text-[#871212]'>{data?.yields || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Monthly amount</div>
                            <div className='text-[#871212]'>{data?.monthly || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Discount</div>
                            <div className='text-[#871212]'>{data?.discount || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Location of issuance</div>
                            <div className='text-[#871212]'>{data?.location || ""}</div>
                        </div>
                        <div className='bg-[#f4f4f4] rounded text-center p-4 flex flex-col items-center min-w-[140px]'>
                            <div>Frozen</div>
                            <div className='text-[#871212]'>{data?.freeze || ""}</div>
                        </div>
                </div>
            </Detailscard>
            <Detailscard
                image={<Image alt="" src={require('../../../assets/listingPriceIcon.png')} />}
                label={'Listing Price'}
            >
                <p>List Price: $20,000</p>
            </Detailscard>

            <Detailscard>
                <><p>About LenderLab Token</p>
                    <p>LenderLab Yield Generating NBT</p>
                    <p className='text-[#871212]'>{`This ra-NBTI asset (Note-Backed Token) entitles you to participation rights in Loan#${data?.loanId || ""} with an origination value of $${data?.loanAmount || ""} with lender qualifier of ${data?.ficoScore || ""} FICO ranking. generating an annual yield ${data?.yield || ""}.It provides a total payout of $${data?.loanAmount || ""} over a term of ${data?.term || ""} years.`}</p>
                    <p>Mint Address - {data?.mintAddress || ""}</p></>
            </Detailscard>
        </div>
    )
}

export default Previewdetailcards