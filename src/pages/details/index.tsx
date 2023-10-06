"use client"
import React, { useEffect, useState } from 'react'
import CreateNftDetails from '@/components/CreateNftDetails'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import { getDashboardLayout } from '@/Layouts'

export default function Details({service}:any) {
  const [preview, setPreview] = useState(false)
  const [nftData, setNftData] = useState()
 
  const mint = async () => {
    console.log(service);
    
  }

  const handlePreview = (data: any) => {
    setPreview(true)
    setNftData(data)
  }
  const handleBack = () => {
    setPreview(false)
  }
  return (
    <>

      <div onClick={() => mint()}>Mint</div>{
        preview ?
          <PreviewNftDetails data={nftData} handleBack={handleBack} />
          :
          <CreateNftDetails handlePreview={handlePreview} />
      }

    </>
  )
}
Details.getLayout = getDashboardLayout;