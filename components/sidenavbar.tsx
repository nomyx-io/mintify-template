import { DetailsIcon, LogoutIcon, NotificationIcon, ProductIcon, SettingsIcon, UsersIcon } from '@/assets'
import Link from 'next/link'
import React from 'react'

const Sidebar = () => {
  return (
    <div className='fixed bg-[#f0f0f0] h-screen p-4 min-w-[16%] z-20'>
        <p className='font-semibold text-lg my-5'>LenderLab</p>
        <div className='h-[85%] flex flex-col gap-4 justify-between flex-grow'>
            <div className='flex flex-col gap-4 text-base'>
                <div className='flex gap-4'>
                  <ProductIcon />
                  <Link href="/">Product Details</Link>
                </div>
                <div className='flex gap-4'>
                  <DetailsIcon />
                  <Link href="/details">Enter Details</Link>
                </div>
                <div className='flex gap-4'>
                  <NotificationIcon />
                  <Link href="/notifications">Notifications</Link>
                </div>
                <div className='flex gap-4'>
                  <SettingsIcon />
                  <Link href="/settings">Settings</Link>
                </div>
            </div>
            <div className='flex flex-col gap-2 justify-end mt-auto'>
                <div className='flex gap-4'>
                  <UsersIcon />
                  <Link href="/users">Users</Link>
                </div>
                <div className='flex gap-4'>
                  <LogoutIcon />
                  <Link href="">Log out</Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Sidebar