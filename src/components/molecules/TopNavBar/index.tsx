import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import React, { useContext } from 'react'
import { Layout, Input } from "antd"
const { Header} = Layout;

import Profile from "../../../assets/image.png"

import { NotificationIcon, SearchIcon } from '@/assets'
import { UserContext } from '@/pages/_app'
import Link from "next/link";


const TopNavBar = (props:any) => {

  const onDisconnect = useContext(UserContext);

  useAccount({
    onDisconnect: function () {
        onDisconnect();
    },
  });

  return (
      <Header className='w-full p-5 flex items-center justify-between'>
          <div className='w-1/4  flex items-center gap-5'>
              {/*<p><Link href={'/home'}>LenderLab</Link></p>*/}
          </div>
          <div className='w-1/2'>
              <Input
                  placeholder='Enter details to mint NFTs'
                  prefix={<SearchIcon/>}
                  crossOrigin={undefined}/>
          </div>
          <div className='w-1/4  flex items-center justify-end gap-5'>
              <ConnectButton chainStatus={'none'}/>
              <Image className='rounded-full' height={40} src={Profile} alt=""/>
          </div>
      </Header>
  )
}

export default TopNavBar;
