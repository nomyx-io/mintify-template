"use client"
import moment from 'moment';
import React, { useEffect, useState } from 'react';

interface Column {
  key: string;
  label: string;
  align: 'left' | 'right' | 'center';
  sortable?: boolean;
  unique?: boolean;
  render?(row: any): React.ReactNode;
}

interface CustomTableProps {
  title?: string;
  description?: string;
  columns: Column[];
  data: any[];
  searchable?: boolean;
  enableTabs?: boolean;
  enableTabsBy?: string;
  statusList?: string[];
}

export const CustomTable: React.FC<CustomTableProps> = ({
  title,
  description,
  columns,
  data,
  searchable = false,
  enableTabs,
  enableTabsBy = '',
  statusList,
}) => {
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    statusList && statusList.length > 0 && setActiveTab(statusList[0]);
  }, []);

  const handleTabClick = (status: string) => {
    setActiveTab(status);
  };

  const handleSort = (column: string) => {
    if (sortedColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortedColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const findUniqueKey = () => {
    const uniqueColumn = columns.find((column) => column.unique === true);
    return uniqueColumn ? uniqueColumn.key : 'id';
  };

  const uniqueKey = findUniqueKey();

  const filteredData =
    enableTabs && activeTab && activeTab !== 'All' ? data.filter((row) => row[enableTabsBy] === activeTab) : data;

  const filteredAndSearchedData = filteredData && filteredData.length > 0 && filteredData.filter((row) => {
    return columns.some((column) => {
      const value = row[column.key];
      return typeof value === 'string' && value.toLowerCase().includes(filterText.toLowerCase());
    });
  });

  const sortedData = sortedColumn
    ? filteredAndSearchedData && filteredAndSearchedData.slice().sort((a, b) => {
      const valueA = a[sortedColumn];
      const valueB = b[sortedColumn];

      if (Number(valueA) < Number(valueB)) return sortDirection === 'asc' ? -1 : 1;
      if (Number(valueA) > Number(valueB)) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    })
    : filteredAndSearchedData && filteredAndSearchedData.slice().sort((a, b) => {
      const valueA = moment((a['attributes'])['createdAt']).format('YYYYMMDDHHMMSS');
      const valueB = moment((b['attributes'])['createdAt']).format('YYYYMMDDHHMMSS');
      if (Number(valueA) < Number(valueB)) return sortDirection === 'desc' ? -1 : 1;
      if (Number(valueA) > Number(valueB)) return sortDirection === 'desc' ? 1 : -1;
      return 0;
    });

  return (
    <>
      <div className='text-xl'>{title}</div>
      <div className='text-base'>{description}</div>

      <div className="flex justify-between mb-4">
        {searchable && (
          <div>
            <label htmlFor="filterInput" className="sr-only">
              Filter
            </label>
            <input
              type="text"
              id="filterInput"
              placeholder="Filter"
              className="px-2 py-1 border border-gray-300 rounded"
              value={filterText}
              onChange={handleFilterChange}
            />
          </div>
        )}
      </div>
      {enableTabs && (
        <div className="flex space-x-4 mb-4">
          {statusList?.map((status) => (
            <button
              key={status}
              className={`py-2 px-4 rounded-md ${activeTab === status ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleTabClick(status)}
            >
              {status}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-x-auto border border-gray-200">
        <table className="min-w-full border-collapse border border-gray-200 ">
          <thead className="bg-gray-50">
            <tr>
              {columns?.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-y border-gray-200 ${column.align === 'right'
                    ? 'text-right'
                    : column.align === 'left'
                      ? 'text-left'
                      : 'text-center'
                    }`}
                >
                  <button
                    key={column.key}
                    className={`ml-2 focus:outline-none ${sortedColumn === column.key ? 'font-bold' : ''
                      }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortedColumn === column.key ? (
                        <span
                          className={`ml-1 ${sortDirection === 'asc' ? 'text-gray-600' : 'text-gray-400'
                            }`}
                        >
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      ) : (
                        column.sortable && (
                          <span className={`ml-1 text-gray-400`}>{sortIcon()}</span>
                        )
                      )}
                    </div>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData && sortedData.length > 0 && sortedData?.map((row, i) => (
              <tr key={row[uniqueKey] || i}>
                {columns?.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 border-y border-gray-200   ${column.align === 'right'
                      ? 'text-right'
                      : column.align === 'left'
                        ? 'text-left'
                        : 'text-center'
                      }`}
                  >
                    {column.render ? (
                      <div
                        className={`flex items-center ${column.align === 'right'
                          ? 'justify-end'
                          : column.align === 'left'
                            ? 'justify-start'
                            : 'justify-center'
                          }`}
                      >
                        {column.render(row)}
                      </div>
                    ) : (
                      row[column.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const sortIcon = () => {
  return (
    <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path fill="#444" d="M11 7h-6l3-4z" />
      <path fill="#444" d="M5 9h6l-3 4z" />
    </svg>
  );
}
