import React from "react";
import { Layout, Menu } from "antd/es";
import type { MenuProps } from "antd";

import { ChartSquare, LanguageSquare, Briefcase } from "iconsax-react";
import Link from "next/link";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const SideNavBar = () => {
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    href?: string,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group"
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label: href ? (
        <Link href={href}>
          <span className="text-nomyx-text-light dark:text-nomyx-text-dark">
            {label}
          </span>
        </Link>
      ) : (
        <span className="text-nomyx-text-light dark:text-nomyx-text-dark">
          {label}
        </span>
      ),
      type,
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    getItem(
      'Dashboard',
      'menu-item-1',
      '/home',
      <ChartSquare className='!text-nomyx-text-light dark:!text-nomyx-text-dark' />
    ),
    getItem(
      'Mint Tokens',
      'menu-item-2',
      '/nft-create',
      <LanguageSquare className='!text-nomyx-text-light dark:!text-nomyx-text-dark' />
    ),
    getItem(
      'Projects',
      'menu-item-3',
      '/projects',
      <Briefcase
        size='20'
        className='!text-nomyx-text-light dark:!text-nomyx-text-dark'
      />
    ),
  ];

  return (
    <Sider className="!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark">
      <Menu
        className="!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark"
        mode="inline"
        items={items}
      />
    </Sider>
  );
};

export default SideNavBar;
