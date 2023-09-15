import React from 'react';
import { Transfer } from 'antd';
import '../../app/globals.css'

interface RecordType {
  key: string;
  title: string;
  description: string;
}
 interface ComplianceType {
  mockData: RecordType[],
  targetKeys: any, 
  selectedKeys: any, 
  onChange: any, 
  onSelectChange: any, 
  onScroll: any
 }

const Compliance = ({
  mockData, 
  targetKeys, 
  selectedKeys, 
  onChange, 
  onSelectChange, 
  onScroll}: ComplianceType) => {
  return (
    <div className='mt-4 p-5 bg-[#f0f0f0]'>
        <p className='mb-2 font-semibold'>Compliance Features</p>
          <Transfer
              dataSource={mockData}
              titles={['First Category', 'Second Category']}
              targetKeys={targetKeys}
              selectedKeys={selectedKeys}
              onChange={onChange}
              onSelectChange={onSelectChange}
              onScroll={onScroll}
              render={(item) => item.title}
          />
    </div>
  );
};

export default Compliance;