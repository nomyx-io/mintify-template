"use client"

import React, { useState } from 'react';
import { Input } from "antd";

const ImageBox = ({file, handleChange, previewPage = false}: any) => {
  return (
    <div className='p-4 h-auto bg-[#f0f0f0]'>
      <p className='font-semibold'>NFT Image Upload</p>
      <p className='mt-6 text-sm font-medium'>Cover Images</p>
        <Input accept="image/png, image/gif, image/jpeg" onChange={(e) => handleChange(e)} type='file' className={`opacity-0 outline-none border-none rounded-none`} crossOrigin={undefined} />
      <div className='mb-1 rounded-none -mt-[35px] bg-white text-center text-sm p-2 font-medium'>Upload or Drag Image</div>
      <p className='text-red-500 text-center text-xs font-medium'>Note: This Section will display a preview of the image you just uploaded</p>
      
      <div className={`relative ${previewPage ? 'h-[320px]' : 'h-[230px]'} p-2 flex flex-col justify-center items-center mt-1 bg-[#cddbf2] min-w-[100px]`}>
        {file && <img src={file} alt="" style={{ objectFit: "contain", maxHeight: "100%" }} />}
      </div>
    </div>
  )
}

export default ImageBox
