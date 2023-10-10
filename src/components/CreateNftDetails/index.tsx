"use client"
import NftDetailsForm from '@/components/molecules/NftDetailsForm'
import Compliance from '@/components/molecules/Compliance'
import ImageComp from '@/components/molecules/ImageBox'
import React, { useState } from 'react'
import { Button } from "../../material-tailwind"
import type { TransferDirection } from 'antd/es/transfer';

export default function CreateNftDetails({ handlePreview, claimTopics }: any) {
  const [file, setFile] = useState('')
  const [nftTitle, setNftTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loanId, setLoanId] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [term, setTerm] = useState("")
  const [ficoScore, setFicoScore] = useState("")
  const [yields, setYields] = useState("")
  const [monthly, setMonthly] = useState("")
  const [discount, setDiscount] = useState("")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [mintAddress, setMintAddress] = useState("")
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
      case "loanId":
        setLoanId(value)
        break;
      case "loanAmount":
        setLoanAmount(value)
        break;
      case "term":
        setTerm(value)
        break;
      case "fico":
        setFicoScore(value)
        break;
      case "yields":
        setYields(value)
        break;
      case "monthly":
        setMonthly(value)
        break;
      case "discount":
        setDiscount(value)
        break;
      case "location":
        setLocation(value)
        break;
      case "price":
        setPrice(value)
        break;
      case "mintAddress":
        setMintAddress(value)
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

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
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

  const handlePreviewFunc = () => {
    handlePreview({ nftTitle, description, loanId, loanAmount, term, ficoScore, yields, monthly, discount, location, price, mintAddress, targetKeys, file })
    console.log("Preview Clicked")
  }

  const fields = [
    {label: 'NFT Title', name: 'nftTitle', dataType: 'text', placeHolder: 'Enter Loan ID.Total Amount(Yield)', defaultValue: nftTitle, value: nftTitle },
    {label: 'Description', name: 'description', dataType: 'text', placeHolder: 'Add a description for the NFT', defaultValue: description, value: description },
    {label: 'Key Feature', name: 'loanId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loanId, value: undefined },
    { 
      value: [
        { label: '', name: 'loanId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loanId, value: loanId },
        { label: '', name: 'loanAmount', dataType: 'text', placeHolder: 'Enter Loan Origination Amount', defaultValue: loanAmount, value: loanAmount },
      ]
    },
    {
      value: [
        { label: '', name: 'term', dataType: 'text', placeHolder: 'Enter Term', defaultValue: term, value: term },
        { label: '', name: 'fico', dataType: 'text', placeHolder: 'Enter FICO Score', defaultValue: ficoScore, value: ficoScore },
      ]
    },
    {
      value: [
        { label: '', name: 'yields', dataType: 'text', placeHolder: 'Enter Interest Rate', defaultValue: yields, value: yields },
        { label: '', name: 'monthly', dataType: 'text', placeHolder: 'Enter Monthly Payment', defaultValue: monthly, value: monthly },
      ]
    },
    {
      value: [
        { label: '', name: 'discount', dataType: 'text', placeHolder: 'Enter Discount Coupan (%age off)', defaultValue: discount, value: discount },
        { label: '', name: 'location', dataType: 'text', placeHolder: 'Location of Issuance (first three letters of zip)', defaultValue: location, value: location },
      ]
    },
    { label: 'Pricing', name: 'price', dataType: 'text', placeHolder: '$', defaultValue: price, value: price },
    { label: 'Mint to', name: 'mintAddress', dataType: 'text', placeHolder: 'Enter Wallet Address', defaultValue: mintAddress, value: mintAddress }
  ]

  return (
    <div className='p-2 w-full flex gap-3'>
      <div className='flex-grow'>
        <NftDetailsForm
          fields={fields}
          handleChange={handleInputValues}
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
