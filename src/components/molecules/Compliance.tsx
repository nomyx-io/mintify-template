import React from 'react';
import { Transfer, Card } from 'antd';

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
    <Card title="Compliance Features" className='overflow-hidden'>
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
          className='overflow-x-scroll md:overflow-auto'
      />
    </Card>
  );
};

export default Compliance;
