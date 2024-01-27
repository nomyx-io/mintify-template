"use client"
import React, { useState } from 'react'
import type { TransferDirection } from 'antd/es/transfer';
import { useRouter } from 'next/router'
import { Form, Button } from 'antd';
import NftDetailsForm from '@/components/molecules/NftDetailsForm';
import Compliance from '@/components/molecules/Compliance';

export default function CreateNftDetails({ 
  claimTopics,
  fields,
  frozen,
  image,
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
  
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // Perform actions with form values, e.g., preview functionality if form has 
    // been submitted all fields are valid and filled out
      handlePreviewFunc(values);
  };

  const handlePreview = (e: any) => {
    // trigger submit on NFT Details Form, only continue if form validation passes
    form.submit();
  };

  return (
    <div className='p-2 w-full flex gap-3'>
      <div className='flex-grow'>
        <NftDetailsForm
          fields={fields}
          frozen={frozen}
          handleChange={handleInputValues}
          handleFreeze={handleFreeze}
          form = {form}
          onFinish={onFinish}
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
        <Button onClick={() => router.push('/home')} className='bg-[#dedede] text-black rounded-none'>Cancel</Button>
        <Button onClick={handlePreview} className='bg-[#637eab] rounded-none'>Preview</Button>
      </div>
    </div>
  )
}
