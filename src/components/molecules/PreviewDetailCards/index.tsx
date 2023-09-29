import Image from 'next/image'
import React from 'react'
import Detailscard from '../../atoms/DetailsCard'

const Previewdetailcards = () => {
    return (
        <div className='flex flex-col gap-4 border border-[#030303] rounded p-4'>
            <Detailscard
                image={<Image alt="" src={require('../../../assets/description.png')} />}
                label={'Description'}>
                <><p>LenderLab First Release</p>
                    <p>1st Generation NBTs maturing 2028</p></>
            </Detailscard>
            <Detailscard
                image={<Image alt="" src={require('../../../assets/traitsIcon.png')} />}
                label={'Traits'}>
                <><p>LenderLab First Release</p>
                    <p>1st Generation NBTs maturing 2028</p></>
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
                    <p>{'This ra-NBTI asset (Note-Backed Token)'} entitles you to participation rights in Loan#00001 with an origination value of $30,000 with lender qualifier of 800+ FICO ranking. generating an annual yield 4%.It provides a total payout of $30,000 over a term of 7 years.</p></>
            </Detailscard>
        </div>
    )
}

export default Previewdetailcards