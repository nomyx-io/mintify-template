import React from 'react';
import { Transfer, Card } from 'antd';

interface RecordType {
  key: string;
  title: string;
  description: string;
}
 interface ComplianceType {
  claimTopics: any,
  targetKeys: any, 
  selectedKeys: any, 
  onChange: any, 
  onSelectChange: any, 
  onScroll: any
 }

const Compliance = ({
  claimTopics,
  targetKeys, 
  selectedKeys, 
  onChange, 
  onSelectChange, 
  onScroll}: ComplianceType) => {
  return (
    <Card title="Compliance Features">
      <Transfer
          dataSource={claimTopics}
          titles={['Available Claims', 'Selected Claims']}
          showSelectAll={false}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
          render={(item) => <div>{item?.displayName}({item.topic})</div>}
      />
    </Card>
  );
};

export default Compliance;
