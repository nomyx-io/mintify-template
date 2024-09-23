import React from 'react'

const ReadOnlyField = ({ image, label, children }: any) => {
    return (
        <div style={{fontSize:"1.3em"}}>
            <p className='text-xs'>
                {image && image}
                {label && label}
            </p>
            <div className='truncate'>
                {children}
            </div>
        </div>
    )
};

export default ReadOnlyField;
