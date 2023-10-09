"use client"
import React, { useEffect, useState } from 'react'
import CreateNftDetails from '@/components/CreateNftDetails'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import { getDashboardLayout } from '@/Layouts'
import { toast } from 'react-toastify'

export default function Details({ service }: any) {
  const [preview, setPreview] = useState(false)
  const [nftData, setNftData] = useState()
  const [claimTopics, setClaimTopics] = useState<any[]>([])

  useEffect(() => {
    getClaimTopics()
  }, [])

  const getClaimTopics = async () => {
    const claims = await service.getClaimTopics()
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
    if (data.nftTitle == "" || data.description == "" || data.loanId == "" || data.loanAmount == "" || data.term == "" || data.fico == "" || data.yields == "" || data.monthly == "" || data.discount == "" || data.location == "" || data.price == "" || data.mint == "" || data.file == "") {
      toast.error("Nft Data is mandatory")
    }
    else {
      setPreview(true)
    }
  }
  const handleBack = () => {
    setPreview(false)
  }
  return (
    <>

      {
        preview ?
          <PreviewNftDetails service={service} data={nftData} handleBack={handleBack} />
          :
          <CreateNftDetails claimTopics={claimTopics} handlePreview={handlePreview} />
      }

    </>
  )
}
Details.getLayout = getDashboardLayout;