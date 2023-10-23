import { DetailsIcon, LogoutIcon, NotificationIcon, ProductIcon, SettingsIcon, UsersIcon } from '@/assets'
import Link from 'next/link'
import React from 'react'
import SideTab from '../../atoms/SideTab'

const Sidebar = () => {
  return (
    <div className='bg-[#f0f0f0] h-screen p-4 min-w-[16%]'>
        <p className='font-semibold text-lg my-5'><Link href={'/home'}>LenderLab</Link></p>
        <div className='h-[85%] flex flex-col gap-4 justify-between flex-grow'>
            <div className='flex flex-col gap-4 text-base'>
                <SideTab icon={<DetailsIcon />} label="Mint New NBT" href="/details" />
                <SideTab icon={<SettingsIcon />} label="Settings" href="/settings" />
            </div>
            <div className='flex flex-col gap-2 justify-end mt-auto'>
                <SideTab icon={<UsersIcon />} label="Users" href="/users" />
                <SideTab icon={<LogoutIcon />} label="Log out" href="" />
            </div>
        </div>
    </div>
  )
}

export default Sidebar
