import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { KronosService } from "@/services/KronosService";
import { useMemo } from "react";

const columns = [
  { title: "Record Id", dataIndex: "objectId" },
  { title: "Date", dataIndex: "createdAt" },
  { title: "Amount", dataIndex: "amount" },
  { title: "Treasury Address", dataIndex: "treasuryAddress" },
];


const InterestClaimHistory = ({ token }: any) => {
  const [withdrawals, setWithdrawals] = useState<any>(token.tokenWithdrawals);

  const api = useMemo(() => KronosService(), []);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        // Replace this with your actual API call
        // For example:
        const response = await api.getTreasuryClaims(token.tokenId);
        setWithdrawals(response || []);
      } catch (error) {
        console.error("Failed to fetch withdrawals:", error);
      }
    };

    if (token?.tokenId) {
      fetchWithdrawals();
    }
  }, [token]);

  return <Table rowKey="objectId" columns={columns} dataSource={withdrawals} pagination={false} scroll={{ y: 400 }}/>;
};

export default InterestClaimHistory;