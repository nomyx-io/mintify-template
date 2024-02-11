import React, {useState} from "react";
import Link from "next/link";
import {Layout, Menu, theme} from "antd/es"

import {
  BankOutlined,
  DashboardOutlined,
  MoneyCollectOutlined,
  SettingOutlined
} from "@ant-design/icons";
import {DetailsIcon, LogoutIcon, SettingsIcon, TreasuryIcon, UsersIcon} from "@/assets";

const { Sider} = Layout;

import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const SideNavBar = () => {

  function getItem(
      label: React.ReactNode,
      key: React.Key,
      href?: string,
      icon?: React.ReactNode,
      children?: MenuItem[],
      type?: 'group',
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label:href?(<Link href={href}>{label}</Link>):label,
      type,
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    getItem('Dashboard', 'menu-item-1', "/home", <DashboardOutlined />),
    getItem('Mint Tokens', 'menu-item-2', "/nft-create", <MoneyCollectOutlined />),
    getItem('Treasury', 'menu-item-4', "/treasury", <BankOutlined />),
    getItem('Settings', 'menu-item-3', "/settings", <SettingOutlined />)
  ];

  return (
    <Sider>
      <Menu
          mode="inline"
          items={items}
      />
    </Sider>
  )
}

export default SideNavBar;
