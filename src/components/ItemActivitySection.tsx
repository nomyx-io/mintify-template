import React, { useEffect, useState } from "react";
import { Table } from "antd";

interface ActivityRecord {
  key: string;
  activity: string;
  date: string;
}

const ItemActivity = ({ token }: any) => {
  const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
  //console.log("activity data", appState.activity);
  // Filter the activity data based on tokenId
  useEffect(() => {
    // Fetch activity data for the given token
    const fetchActivityData = async () => {
      try {
        // Replace this with your actual API call
        // For example: const response = await api.getActivityForToken(token.tokenId);
        // For demonstration purposes, we'll use mock data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data representing all activity
        const allActivity = [
          {
            event: "Transfer",
            createdAt: "2023-10-05T10:00:00Z",
            tokens: [{ tokenId: token.tokenId }],
          },
          {
            event: "Sale",
            createdAt: "2023-10-06T12:00:00Z",
            tokens: [{ tokenId: "otherTokenId" }],
          },
          // Add more mock activities as needed
        ];

        // Filter activity data for the given token
        const filteredActivity = allActivity.filter((act: any) => {
          return act.tokens.some((activityToken: any) => activityToken.tokenId === token.tokenId);
        });

        const formattedActivity = filteredActivity.map((act: any, index: number) => ({
          key: index.toString(),
          activity: act.event,
          date: new Date(act.createdAt).toLocaleString(),
        }));

        setActivityData(formattedActivity);
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      }
    };

    fetchActivityData();
  }, [token]);

  const columns = [
    { title: "Activity", dataIndex: "activity" },
    { title: "Date", dataIndex: "date" },
  ];

  return <Table rowKey={(record) => record.key} columns={columns} dataSource={activityData} pagination={false} scroll={{ y: 400 }} />;
};

export default ItemActivity;
