import React from 'react'

const Detailscard = ({ image, label, children }: any) => {
    return (
        <div>
            <p className='flex gap-1 mb-1'>
                {image && image}
                {label && label}
            </p>
            <div className='border border-[#c0c0c0] border-dashed rounded p-3 text-xs'>
                {children}
            </div>
        </div>
    )
}

export default Detailscard