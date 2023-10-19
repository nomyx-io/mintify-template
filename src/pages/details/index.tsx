"use client"
import React, { useEffect, useState } from 'react'
import CreateNftDetails from '@/components/CreateNftDetails'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import { getDashboardLayout } from '@/Layouts'
import { toast } from 'react-toastify'
import { TransferDirection } from 'antd/es/transfer'
import {validateData} from '@/utils'

export default function Details({ service }: any) {
  const [preview, setPreview] = useState(false)
  const [nftData, setNftData] = useState()
  const [claimTopics, setClaimTopics] = useState<any[]>([])
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
  const [currentValue, setCurrentValue] = useState("")
  const [originationDate, setOriginationDate] = useState("")
  const [frozen, setFrozen] = useState(false)
  
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
      case "currentValue":
        setCurrentValue(value)
        break;
      case "originationDate":
        setOriginationDate(value)
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
    const freeze = JSON.stringify(frozen)
    handlePreview({ nftTitle, description, loanId, loanAmount, term, ficoScore, yields, monthly, discount, location, price, mintAddress, targetKeys, file, originationDate, currentValue, freeze})
    console.log("Preview Clicked")
  }

  const fields = [
    {label: 'NFT Title', name: 'nftTitle', dataType: 'text', placeHolder: 'Enter Loan ID.Total Amount(Yield)', defaultValue: nftTitle, value: nftTitle },
    {label: 'Description', name: 'description', dataType: 'text', placeHolder: 'Add a description for the NFT', defaultValue: description, value: description },
    {label: 'Key Feature', name: 'loanId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loanId, value: undefined },
    { 
      value: [
        { label: '', name: 'loanId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loanId, value: loanId },
        { label: '', name: 'currentValue', dataType: 'text', placeHolder: 'Enter Current Value', defaultValue: currentValue, value: currentValue },
      ]
    },
    { 
      value: [
        { label: '', name: 'originationDate', dataType: 'date', placeHolder: 'Enter Loan Origination Date', defaultValue: originationDate, value: originationDate },
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

  useEffect(() => {
    getClaimTopics()
  }, [service])

  const getClaimTopics = async () => {
    const claims =  service && await service.getClaimTopics()
    let data: any = []
    if (claims) {
      claims.forEach((item: any) => {
        data.push({ key: parseInt(item.attributes.topic), displayName: item.attributes.displayName, id: item.id, topic: item.attributes.topic })
      });
      setClaimTopics(data);
    }
  }
  const mint = async () => {
    console.log(service);

  }

  const handlePreview = (data: any) => {
    setNftData(data)
    if (data.nftTitle == "" || data.description == "" || data.loanId == "" || data.loanAmount == "" || data.term == "" || data.ficoScore == "" || data.yields == "" || data.monthly == "" || data.discount == "" || data.location == "" || data.price == "" || data.mint == "" || data.file == "" || data.originationDate == "" || data.currentValue == "") {
      toast.error("Nft Data is mandatory")
    }
    else {
      if (validateData(data)) {
        setPreview(true)
      }
    }
  }
  const handleBack = () => {
    setPreview(false)
  }

  const handleFreeze = () => {
    setFrozen(!frozen)
  }
  
  return (
    <>

      {
        preview ?
          <PreviewNftDetails service={service} data={nftData} handleBack={handleBack} />
          :
          <CreateNftDetails 
            claimTopics={claimTopics} 
            fields={fields}
            frozen={frozen}
            file={file}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            handleInputValues={handleInputValues}
            handlePreviewFunc={handlePreviewFunc}
            handleImage={handleImage}
            onChange={onChange}
            onSelectChange={onSelectChange}
            onScroll={onScroll}
            handleFreeze={handleFreeze}
          />
      }

    </>
  )
}
Details.getLayout = getDashboardLayout;