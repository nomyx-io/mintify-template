import React, { useContext } from 'react'
import Image from 'next/image'
import { Layout } from "antd/es"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { UserContext } from '@/pages/_app'
import Link from "next/link";
import logo from "@/assets/LenderLabLogo.svg";

const { Header} = Layout;

const TopNavBar = () => {

  const onDisconnect = useContext(UserContext);

  useAccount({
    onDisconnect: function () {
        onDisconnect();
    },
  });

  return (
      <Header className='w-full p-5 flex items-center justify-between'>
          <div>
              <Link href={'/home'}><Image alt="" src={logo} /></Link>
          </div>
          <div className='flex items-center justify-end gap-5'>
              <ConnectButton />
          </div>
      </Header>
  )
}

export default TopNavBar;
