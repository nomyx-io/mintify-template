import React from "react";
import {Layout, Menu} from "antd/es"
import type { MenuProps } from 'antd';

import {
  BankOutlined,
  DashboardOutlined,
  MoneyCollectOutlined,
  SettingOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Sider} = Layout;

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
      label:href?(
        <Link href={href}>
          <span className="text-nomyx-text-light dark:text-nomyx-text-dark">
            {label}
          </span>
        </Link>):(
          <span className="text-nomyx-text-light dark:text-nomyx-text-dark">
            {label}
          </span>
        ),
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
    <Sider className="!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark">
      <Menu
          className="!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark"
          mode="inline"
          items={items}
      />
    </Sider>
  )
}

export default SideNavBar;
