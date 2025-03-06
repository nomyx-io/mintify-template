import React from "react";

import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Input, Space, Select, DatePicker } from "antd";
import { useRouter } from "next/router";

interface PoolsHeaderProps {
  setOpen: (open: boolean) => void;
}

const PoolsHeader: React.FC<PoolsHeaderProps> = ({ setOpen }) => {
  const router = useRouter();
  const { query } = router;
  const viewMode = query?.viewMode || "table";
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
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Input placeholder="Search" prefix={<SearchOutlined />} value={queryString} onChange={handleSearch} className="w-48" />

          <DatePicker placeholder="Start Date" className="w-40" />

          <DatePicker placeholder="Maturity Date" className="w-40" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type={viewMode === "card" ? "primary" : "default"}
            icon={<AppstoreOutlined />}
            onClick={() => handleViewModeChange("card")}
            className={`flex items-center justify-center ${viewMode === "card" ? "bg-blue-600" : ""}`}
          />
          <Button
            type={viewMode === "table" ? "primary" : "default"}
            icon={<UnorderedListOutlined />}
            onClick={() => handleViewModeChange("table")}
            className={`flex items-center justify-center ${viewMode === "table" ? "bg-blue-600" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

export default PoolsHeader;
