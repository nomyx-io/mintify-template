import React from 'react';
import { Transfer } from 'antd';

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
    <div className='mt-4 p-5 bg-[#f0f0f0]'>
        <p className='mb-2 font-semibold'>Compliance Features</p>
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
    </div>
  );
};

export default Compliance;