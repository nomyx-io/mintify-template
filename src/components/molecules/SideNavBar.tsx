import React from "react";
import {Layout, Menu} from "antd/es"
import type { MenuProps } from 'antd';

import Link from "next/link";
import { Briefcase, ChartSquare, LanguageSquare } from "iconsax-react";

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
      label:href?(<Link href={href}>{label}</Link>):label,
      type,
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    getItem('Dashboard', 'menu-item-1', "/home", <ChartSquare size="20" />),
    getItem('Mint Tokens', 'menu-item-2', "/nft-create", <LanguageSquare size="20" />),
    getItem('Projects', 'menu-item-3', "/projects", <Briefcase size="20" />)
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
