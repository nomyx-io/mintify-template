import React, {useEffect, useState} from "react";
import {Table} from "antd/es";

const columns =     [
  //deposit columns
  {
    title: 'Record Id',
    dataIndex: 'objectId'
  },
  {
    title: 'Deposit Id',
    dataIndex: ['deposit','objectId']
  },
  {
    title: 'Deposit Amount',
    dataIndex: 'amount'
  },
  {
    title: 'Created Date',
    dataIndex: 'createdAt'
  }
];

const YieldDeposits = ({token}:any) => {
  const [deposits, setDeposits] = useState<any>(token.deposits);

  useEffect(() => {
    // If deposits are not provided in the token, fetch them
    if ((!deposits || deposits.length === 0) && token?.tokenId) {
      const fetchDeposits = async () => {
        try {
          // Replace this with your actual API call
          // For example:
          // const response = await api.getDepositsForToken(token.tokenId);
          // setDeposits(response.data);
          // For demonstration purposes, we'll use mock data
          const mockDeposits = [
            {
              objectId: "record123",
              deposit: { objectId: "deposit456" },
              amount: 1000,
              createdAt: "2023-10-01",
            },
            {
              objectId: "record789",
              deposit: { objectId: "deposit012" },
              amount: 2000,
              createdAt: "2023-10-02",
            },
          ];
          setDeposits(mockDeposits);
        } catch (error) {
          console.error("Failed to fetch deposits:", error);
        }
      };

      fetchDeposits();
    }
  }, [token, deposits]);

  return (<Table rowKey="depositId" columns={columns} dataSource={deposits} pagination={false} scroll={{ y: 400 }}></Table>);
};

export default YieldDeposits;
