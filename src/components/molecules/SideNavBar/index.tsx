import { DetailsIcon, LogoutIcon, NotificationIcon, ProductIcon, SettingsIcon, TreasuryIcon, UsersIcon } from '@/assets'
import Link from 'next/link'
import React from 'react'
import SideTab from '../../atoms/SideTab'
import { Layout, Input } from "antd"
const { Sider} = Layout;

const Sidebar = () => {
  return (
    <Sider>
      <div>
        <div>
          <SideTab icon={<DetailsIcon />} label="Mint New NBT" href="/nft-create" />
          <SideTab icon={<TreasuryIcon />} label="Treasury" href="/treasury" />
          <SideTab icon={<SettingsIcon />} label="Settings" href="/settings" />
        </div>
        <div className='flex flex-col gap-2 justify-end mt-auto'>
          <SideTab icon={<UsersIcon />} label="Users" href="/users" />
          <SideTab icon={<LogoutIcon />} label="Log out" href="/" />
        </div>
      </div>
    </Sider>
  )
}

export default Sidebar
