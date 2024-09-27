import React from 'react';
import { Transfer, Card } from 'antd';

 interface ComplianceProps {
  claimTopics: ClaimTopic[],
  targetKeys: string[], 
  selectedKeys: string[], 
  onChange: TransferOnChange, 
  onSelectChange: TransferOnSelectChange, 
  onScroll: TransferOnScroll
 }

const Compliance = ({
  claimTopics,
  targetKeys, 
  selectedKeys, 
  onChange, 
  onSelectChange, 
  onScroll
}: ComplianceProps) => {
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
