"use client"
import React, { ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import { Button, FormInstance } from 'antd';
import NftDetailsForm from '@/components/molecules/NftDetailsForm';
import Compliance from '@/components/molecules/Compliance';
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox';

interface CreateNftDetailsProps {
  claimTopics: ClaimTopic[];
  fieldGroups: NftDetailsInputFieldGroup[];
  targetKeys: string[];
  selectedKeys: string[];
  handleInputValues: (
    inputName: string,
    e: ChangeEvent<HTMLInputElement> | CheckboxChangeEvent
  ) => void;
  handlePreview: () => void;
  onChange: TransferOnChange;
  onSelectChange: TransferOnSelectChange;
  onScroll: TransferOnScroll;
  form: FormInstance;
}

export default function CreateNftDetails({
  claimTopics,
  fieldGroups,
  targetKeys,
  selectedKeys,
  handleInputValues,
  handlePreview,
  onChange,
  onSelectChange,
  onScroll,
    form
}: CreateNftDetailsProps) {
  
  const router = useRouter();

  return (
    <div className='w-full flex flex-col gap-3'>

                <NftDetailsForm
                    fieldGroups={fieldGroups}
                    handleChange={handleInputValues}
                    form = {form}
                    onFinish={handlePreview}
                />
      <Compliance
        claimTopics={claimTopics}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={onChange}
        onSelectChange={onSelectChange}
        onScroll={onScroll}
      />


      <div className="actions flex gap-3">
        <Button className="text-nomyx-text-light dark:text-nomyx-text-dark" onClick={() => router.push("/home")}>
          Cancel
        </Button>
        <Button className="text-nomyx-text-light dark:text-nomyx-text-dark" type="primary" onClick={form.submit}>
          Preview
        </Button>
      </div>
    </div>
  )
}
