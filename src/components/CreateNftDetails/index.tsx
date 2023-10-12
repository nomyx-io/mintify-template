"use client"
import NftDetailsForm from '@/components/molecules/NftDetailsForm'
import Compliance from '@/components/molecules/Compliance'
import ImageComp from '@/components/molecules/ImageBox'
import React, { useState } from 'react'
import { Button } from "../../material-tailwind"
import type { TransferDirection } from 'antd/es/transfer';

export default function CreateNftDetails({ 
  claimTopics,
  fields,
  frozen,
  file,
  targetKeys,
  selectedKeys,
  handleInputValues,
  handlePreviewFunc,
  handleImage,
  onChange,
  onSelectChange,
  onScroll,
  handleFreeze
 }: any) {
  

  return (
    <div className='p-2 w-full flex gap-3'>
      <div className='flex-grow'>
        <NftDetailsForm
          fields={fields}
          frozen={frozen}
          handleChange={handleInputValues}
          handleFreeze={handleFreeze}
        />
        <Compliance
          claimTopics={claimTopics}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
        />
      </div>
      <div className='w-[30%] flex flex-col gap-4'>
        <Button className='bg-[#dedede] text-black rounded-none'>Cancel</Button>
        <Button onClick={handlePreviewFunc} className='bg-[#637eab] rounded-none'>Preview</Button>
        <ImageComp file={file} handleChange={handleImage} />
      </div>
    </div>
  )
}
