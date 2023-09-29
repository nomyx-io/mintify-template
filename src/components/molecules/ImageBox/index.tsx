"use client"
import React, { useState } from 'react'
import { Input } from "@material-tailwind/react"
import Image from 'next/image'

const ImageBox = ({file, handleChange, previewPage = false}: any) => {
  return (
    <div className='p-4 h-auto bg-[#f0f0f0]'>
        <p className='font-semibold'>Image</p>
        <p className='mt-6 text-sm font-medium'>Cover Images</p>
        <div className={`relative ${previewPage ? 'h-[320px]' : 'h-[230px]'} p-2 flex justify-center items-center mt-1 bg-[#cddbf2] min-w-[100px]`}>
            {file ? <Image src={file} alt="" fill style={{objectFit:'contain'}}  /> :
            <div className='w-3/4 flex flex-col'>
            <Input onChange={(e) => handleChange(e)} type='file' className={`opacity-0 outline-none border-none rounded-none`} labelProps={{className: 'before:mr-0 after:ml-0 hidden',}} />
            <div className='mb-1 rounded-none -mt-[40px] bg-white text-center text-sm p-2 font-medium'>Upload or Drage Image</div>
            <p className='text-red-500 text-center text-xs font-medium'>Note: This Section will display a preview of the image you just uploaded</p>
            </div>
            }
        </div>
      </div>
  )
}

export default ImageBox