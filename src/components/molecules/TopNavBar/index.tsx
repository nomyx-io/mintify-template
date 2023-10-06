import React from 'react'
import { Input } from "../../../material-tailwind"
import Profile from "../../../assets/image.png"
import Image from 'next/image'
import { NotificationIcon, SearchIcon } from '@/assets'
import { ConnectButton } from '@rainbow-me/rainbowkit'


const Topnavbar = () => {
  return (
    <div className='bg-[#f0f0f0] w-full p-5 flex items-center justify-between'>
      <div className='w-1/2'>
        <Input
          className='bg-white'
          placeholder='Enter details to mint NFTs'
          icon={<SearchIcon />} crossOrigin={undefined} />
      </div>
      <div className='w-1/2  flex items-center justify-end gap-5'>
        <ConnectButton chainStatus={'none'} />
        <Image className='rounded-full' height={40} src={Profile} alt="" />
      </div>
    </div>
  )
}

export default Topnavbar