"use client"
import React from 'react'
import { useRouter } from 'next/router'
import { Button } from 'antd';
import NftDetailsForm from '@/components/molecules/NftDetailsForm';
import Compliance from '@/components/molecules/Compliance';

export default function CreateNftDetails({ 
  claimTopics,
  fieldGroups,
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
    form
 }: any) {
  
  const router = useRouter();


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
    <div className='w-full grid gap-3'>

            <div className="col-span-1">
                <NftDetailsForm
                    fieldGroups={fieldGroups}
                    handleChange={handleInputValues}
                    form = {form}
                    onFinish={onFinish}
                />
            </div>
            <div className="col-span-1">
                <Compliance
                    claimTopics={claimTopics}
                    targetKeys={targetKeys}
                    selectedKeys={selectedKeys}
                    onChange={onChange}
                    onSelectChange={onSelectChange}
                    onScroll={onScroll}
                />
            </div>


        <div className="actions flex gap-3">
            <Button onClick={() => router.push('/home')}>Cancel</Button>
            <Button type="primary" onClick={handlePreview}>Preview</Button>
        </div>
    </div>
  )
}
