import React from 'react'
import { Input } from "../material-tailwind"
import  Profile  from "../assets/image.png"
import Image from 'next/image'
import { NotificationIcon, SearchIcon } from '@/assets'


const Topnavbar = () => {
  return (
    <div className='fixed right-0 bg-[#f0f0f0] w-[84%] p-5 flex items-center justify-between z-20'>
        <div className='w-1/2'>
            <Input 
            className='bg-white' 
            placeholder='Enter details to mint NFTs' 
            icon={<SearchIcon />} 
            />
        </div>
        <div className='w-1/2  flex items-center justify-end gap-2'>
          <Image className='rounded-full' height={40} src={Profile} alt="" />
        </div>
    </div>
  )
}

export default Topnavbar