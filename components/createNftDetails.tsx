"use client"
import NftDetailsForm from '@/components/molecules/nftdetailsform'
import Compliance from '@/components/molecules/compliance'
import ImageComp from '@/components/molecules/imageComp'
import React, { useState } from 'react'
import { Button } from "../material-tailwind"
import type { TransferDirection } from 'antd/es/transfer';

export default function CreateNftDetails() {
  const [file, setFile] = useState('')
  const [nftTitle, setNftTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loadId, setLoanId] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [term, setTerm] = useState("")
  const [fico, setFico] = useState("")
  const [yields, setYields] = useState("")
  const [monthly, setMonthly] = useState("")
  const [price, setPrice] = useState("")
  const [mint, setMint] = useState("")
  const handleInputValues = (e: any) => {
    const name = e.target.name
    const value = e.target.value
    switch (name) {
      case "nftTitle":
        setNftTitle(value)
        break;
      case "description":
        setDescription(value)
        break;
      case "loadId":
        setLoanId(value)
        break;
      case "loanAmount":
        setLoanAmount(value)
        break;
      case "term":
        setTerm(value)
        break;
      case "fico":
        setFico(value)
        break;
      case "yields":
        setYields(value)
        break;
      case "monthly":
        setMonthly(value)
        break;
      case "price":
        setPrice(value)
        break;
      case "mintAddress":
        setMint(value)
        break;

      default:
        break;
    }
  }

  const handleImage = (e: any) => {
    setFile(URL.createObjectURL(e.target.files[0]))
  }
  interface RecordType {
    key: string;
    title: string;
    description: string;
  }

  const mockData: RecordType[] = Array.from({ length: 10 }).map((_, i) => ({
    key: i.toString(),
    title: `Option ${i + 1}`,
    description: `description of content${i + 1}`,
  }));

  const initialTargetKeys = mockData.filter((item) => Number(item.key) > 5).map((item) => item.key);
  const [targetKeys, setTargetKeys] = useState(initialTargetKeys);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {
    console.log('direction:', direction);
    console.log('target:', e.target);
  };

  const handlePreview = () => {
    console.log("Preview Clicked")
  }

  const fields = [
    {label: 'NFT Title', name: 'nftTitle', dataType: 'text', placeHolder: 'Enter Loan ID.Total Amount(Yield)', defaultValue: nftTitle, value: nftTitle },
    {label: 'Description', name: 'description', dataType: 'text', placeHolder: 'Add a description for the NFT', defaultValue: description, value: description },
    {label: 'Key Feature', name: 'loadId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loadId, value: undefined },
    { 
      value: [
        {label: '', name: 'loadId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loadId, value: loadId },
        {label: '', name: 'loanAmount', dataType: 'text', placeHolder: 'Enter Loan Origination Amount', defaultValue: loanAmount, value: loanAmount },
      ]
    },
    { 
      value: [
        {label: '', name: 'term', dataType: 'text', placeHolder: 'Enter Term', defaultValue: term, value: term },
        {label: '', name: 'fico', dataType: 'text', placeHolder: 'Enter FICO Score', defaultValue: fico, value: fico },
      ]
    },
    { 
      value: [
        {label: '', name: 'yields', dataType: 'text', placeHolder: 'Enter Yield', defaultValue: yields, value: yields },
        {label: '', name: 'monthly', dataType: 'text', placeHolder: 'Enter Monthly', defaultValue: monthly, value: monthly },
      ]
    },
    {label: 'Pricing', name: 'price', dataType: 'text', placeHolder: '$', defaultValue: price, value: price },
    {label: 'Mint to', name: 'mintAddress', dataType: 'text', placeHolder: 'Enter Wallet Address', defaultValue: mint, value: mint }
  ]

  return (
    <div className='p-2 w-full flex gap-3'>
      <div className='flex-grow'>
        <NftDetailsForm
          fields={fields}
          handleChange={handleInputValues}
        />
        <Compliance
          mockData={mockData}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
        />
      </div>
      <div className='w-[30%] flex flex-col gap-4'>
        <Button className='bg-[#dedede] text-black rounded-none'>Cancel</Button>
        <Button onClick={handlePreview} className='bg-[#637eab] rounded-none'>Preview</Button>
        <ImageComp file={file} handleChange={handleImage} />
      </div>
    </div>
  )
}
