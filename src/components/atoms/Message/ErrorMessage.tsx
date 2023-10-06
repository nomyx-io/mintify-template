import React from 'react'

export const ErrorMessage = ({ error }: any) => {
    return (
        <div className=" text-red-700" >
            {error}
        </div>)
}