import React from "react";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface InterestTokenHistoryRecord {
  id: string;
  toHash: string;
  createdDate: string;
  total: number;
}

interface InterestTokenHistoryViewProps {
  records: InterestTokenHistoryRecord[];
}

const InterestTokenHistoryView: React.FC<InterestTokenHistoryViewProps> = ({ records }) => {
  const columns: ColumnsType<InterestTokenHistoryRecord> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: "To Hash",
      dataIndex: "toHash",
      key: "toHash",
      ellipsis: true,
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (value) => Intl.NumberFormat("en-US").format(value),
    },
  ];

  return <Table columns={columns} dataSource={records} rowKey="toHash" className="custom-table" pagination={{ pageSize: 10 }} />;
};

export default InterestTokenHistoryView;
