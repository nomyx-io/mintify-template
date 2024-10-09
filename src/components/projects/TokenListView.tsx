import React, { useState, useEffect } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Table } from "antd";
import { hashToColor } from "@/utils/colorUtils";
import { Switch } from "antd";

interface TokenListViewProps {
  projects: any[];
  onProjectClick: (project: any) => void;
  isSalesHistory: boolean; // New prop to determine if this is a sales history view
}

const TokenListView: React.FC<TokenListViewProps> = ({ projects, onProjectClick, isSalesHistory }) => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [filterQuery, setFilterQuery] = useState("");

  // Effect to update filtered projects whenever projects data changes
  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  // Filter handling
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setFilterQuery(query);
    setFilteredProjects(
      projects.filter((project) => project.token?.nftTitle.toLowerCase().includes(query) || project.price.toString().includes(query))
    );
  };

  // Handle status change
  const handleStatusChange = (tokenId: string, checked: boolean) => {
    setFilteredProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.tokenId === tokenId
          ? {
              ...project,
              token: { ...project.token, status: checked ? "listed" : "unlisted" },
            }
          : project
      )
    );
  };

  // Generate SVG Icon
  const generateSvgIcon = (color: string) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#003366" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="15" fill={`url(#gradient-${color})`} />
        <text
          x="50%"
          y="50%"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="40"
          fill="white"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          KC
        </text>
      </svg>
    );
  };

  // Define columns conditionally based on `isSalesHistory`
  const listingColumns = [
    {
      title: 'Title',
      dataIndex: 'tokenId',
      render: (tokenId: string, record: any) => {
        const color = hashToColor(tokenId);
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isSalesHistory && (
              <EyeOutlined
                className='text-xl cursor-pointer hover:text-blue-500'
                onClick={() => onProjectClick(record)}
                style={{ marginRight: '8px' }}
              />
            )}
            {!isSalesHistory && (
              <div
                style={{
                  width: '1px',
                  height: '24px',
                  backgroundColor: '#ccc',
                  marginRight: '8px',
                }}
              />
            )}
            {generateSvgIcon(color)}
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
              {record.token?.nftTitle}
            </span>
          </div>
        );
      },
      sorter: (a: any, b: any) =>
        a.token.nftTitle.localeCompare(b.token.nftTitle),
    },
    {
      title: 'Price Per Credit',
      dataIndex: ['token', 'price'],
      sorter: (a: any, b: any) => a.token.price - b.token.price,
    },
    {
      title: 'Total Price',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'Registry ID',
      dataIndex: ['token', 'registerId'],
      render: (registerId: string) => <span>{registerId}</span>,
      sorter: (a: any, b: any) =>
        a.token.registerId.localeCompare(b.token.registerId),
    },
    // {
    //   title: "Tranche Cutoff",
    //   dataIndex: ["token", "trancheCutoff"],
    //   render: (trancheCutoff: string) => <span>{trancheCutoff}</span>,
    //   sorter: (a: any, b: any) => a.token.trancheCutoff.localeCompare(b.token.trancheCutoff),
    // },
    {
      title: 'Carbon Offset (Tons)',
      dataIndex: ['token', 'existingCredits'],
      render: (existingCredits: number) => <span>{existingCredits}</span>,
      sorter: (a: any, b: any) =>
        a.token.existingCredits - b.token.existingCredits,
    },
    {
      title: 'Issuance Date',
      dataIndex: ['token', 'issuanceDate'],
      render: (issuanceDate: string) => <span>{issuanceDate}</span>,
      sorter: (a: any, b: any) =>
        a.token.issuanceDate.localeCompare(b.token.issuanceDate),
    },
    {
      title: 'GHG Reduction Type',
      dataIndex: ['token', 'ghgReduction'],
      render: (ghgReduction: string) => <span>{ghgReduction}</span>,
      sorter: (a: any, b: any) =>
        a.token.ghgReduction.localeCompare(b.token.ghgReduction),
    },
    {
      title: 'Geography',
      dataIndex: ['token', 'country'],
      // render: (country: string, state: string) => <span>{country && state ? `${country}, ${state.}` : country || state}</span>,
      render: (country: string) => <span>{country}</span>,
      // compare country and state
      sorter: (a: any, b: any) =>
        a.token.country === b.token.country
          ? a.token.state.localeCompare(b.token.state)
          : a.token.country.localeCompare(b.token.country),
    },
    {
      title: 'Status',
      dataIndex: ['token', 'status'],
      render: (status: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '160px' }}>
          <span
            className={`py-1 px-2 mr-10 w-20 text-center rounded border ${
              status === 'listed'
                ? 'border-nomyx-success-light text-nomyx-success-light bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark'
                : 'border-nomyx-danger-light text-nomyx-danger-light bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark'
            }`}>
            {status}
          </span>
          <Switch
            checked={status === 'listed'}
            onChange={(checked) => handleStatusChange(record.tokenId, checked)}
          />
        </div>
      ),
      sorter: (a: any, b: any) => a.token.status.localeCompare(b.token.status),
    },
  ];

  return (
    <Table
      columns={listingColumns}
      dataSource={filteredProjects}
      rowKey="tokenId"
      pagination={false}
      scroll={{ x: "max-content" }}
      style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
    />
  );
};

export default TokenListView;
