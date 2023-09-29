"use client"
import React, {useState} from 'react'
import CreateNftDetails from '@/components/CreateNftDetails'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import { getDashboardLayout } from '@/Layouts'

export default function Details() {
  const [preview, setPreview] = useState(false)
  const [nftData, setNftData] = useState()
  const handlePreview = (data: any) => {
    setPreview(true)
    setNftData(data)
  }
  const handleBack = () => {
    setPreview(false)
  }
  return (
    preview ? 
      <PreviewNftDetails data={nftData} handleBack={handleBack} /> 
      :
      <CreateNftDetails handlePreview={handlePreview} />
  )
}
Details.getLayout = getDashboardLayout;