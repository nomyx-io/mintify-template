"use client"

import React, {useState} from 'react';
import {Card, Input} from "antd";

const ImageBox = ({file, handleChange, previewPage = false}: any) => {
    return (

        <Card title="NFT Image Upload" className="no-padding">
            <div className='p-4 h-auto'>

                <Input
                    accept="image/png, image/gif, image/jpeg"
                    onChange={(e) => handleChange(e)}
                    type='file'
                    className={"opacity-0 outline-none border-none rounded-none"} crossOrigin={undefined}/>

                <div className='mb-1 rounded-none -mt-[35px] text-center text-sm p-2 font-medium'>Upload or Drag Image</div>

                <p className='text-red-500 text-center text-xs font-medium'>Note: This Section will display a preview of the image you just uploaded</p>

                <div
                    className={`relative ${previewPage ? 'h-[320px]' : 'h-[230px]'} p-2 flex flex-col justify-center items-center mt-1 min-w-[100px]`}>
                        {file && <img src={file} alt="" style={{objectFit: "contain", maxHeight: "100%"}}/>}
                </div>
            </div>
        </Card>
    )
}

export default ImageBox
