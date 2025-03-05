import React from "react";

import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Input, Space, Tabs } from "antd";
import { useRouter } from "next/router";

interface PoolsHeaderProps {
  setOpen: (open: boolean) => void;
}

const PoolsHeader: React.FC<PoolsHeaderProps> = ({ setOpen }) => {
  const router = useRouter();
  const { query } = router;
  const viewMode = query?.viewMode || "card";
  const queryString = (query?.query as string) || "";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    router.push({
      pathname: router.pathname,
      query: { ...query, query: value },
    });
  };

  const handleViewModeChange = (mode: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...query, viewMode: mode },
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-nomyx-text-light dark:text-nomyx-text-dark mb-2">Customer View</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and explore customer pools</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <Input placeholder="Search pools" prefix={<SearchOutlined />} value={queryString} onChange={handleSearch} className="w-full sm:w-64" />

        <Space>
          <Button
            type={viewMode === "card" ? "primary" : "default"}
            icon={<AppstoreOutlined />}
            onClick={() => handleViewModeChange("card")}
            className={viewMode === "card" ? "bg-[#3c89e8]" : ""}
          />
          <Button
            type={viewMode === "table" ? "primary" : "default"}
            icon={<UnorderedListOutlined />}
            onClick={() => handleViewModeChange("table")}
            className={viewMode === "table" ? "bg-[#3c89e8]" : ""}
          />
          <Button type="primary" onClick={() => setOpen(true)} className="bg-[#3c89e8]">
            Create New Pool
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PoolsHeader;
