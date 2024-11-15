import React from "react";

import type { MenuProps } from "antd";
import { Layout, Menu } from "antd/es";
import { ChartSquare, LanguageSquare, Briefcase } from "iconsax-react";
import Link from "next/link";
import { useRouter } from "next/router";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const SideNavBar = () => {
  const router = useRouter();

  function getItem(label: React.ReactNode, href?: string, icon?: React.ReactNode, children?: MenuItem[], type?: "group"): MenuItem {
    return {
      key: href || "",
      icon,
      children,
      label: href ? (
        <Link href={href}>
          <span className="text-nomyx-text-light dark:text-nomyx-text-dark">{label}</span>
        </Link>
      ) : (
        <span className="text-nomyx-text-light dark:text-nomyx-text-dark">{label}</span>
      ),
      type,
    } as MenuItem;
  }

  const items: MenuProps["items"] = [
    getItem("Dashboard", "/home", <ChartSquare className="!text-nomyx-text-light dark:!text-nomyx-text-dark" />),
    getItem("Mint Tokens", "/nft-create", <LanguageSquare className="!text-nomyx-text-light dark:!text-nomyx-text-dark" />),
    getItem("Projects", "/projects", <Briefcase size="20" className="!text-nomyx-text-light dark:!text-nomyx-text-dark" />),
  ];

  return (
    <Sider className="!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark">
      <Menu className="!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark" mode="inline" items={items} selectedKeys={[router.pathname]} />
    </Sider>
  );
};

export default SideNavBar;
