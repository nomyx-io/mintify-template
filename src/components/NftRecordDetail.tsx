import React from 'react';
import { Button, Card, Checkbox, Table, Tabs } from 'antd';

import { useRouter } from 'next/router';
import { ShareIcon } from '@/assets';
import { LeftOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { hashToColor } from '@/utils/colorUtils';

const TabPane = Tabs.TabPane;

const fieldGroups: NftRecordDetailFieldGroup[] = [
  {
    name: 'Project Info',
    fields: [
      { name: 'projectName', label: 'Project' },
      { name: 'auditor', label: 'Auditor' },
      { name: 'projectStartDate', label: 'Start Date' },
      { name: 'mintAddress', label: 'Mint to' },
      { name: 'country', label: 'Country' },
      { name: 'state', label: 'State' },
      { name: 'registerId', label: 'Registry Id' },
      { name: 'registryURL', label: 'Registry Link' },
      { name: 'issuanceDate', label: 'Issuance Date' },
      { name: 'ghgReduction', label: 'GHG Reduction' },
      { name: 'trancheCutoff', label: 'Tranche Cutoff' },
    ],
  },
  {
    name: 'Credit Info',
    fields: [
      { name: 'creditsPre2020', label: 'Pre 2020 Credits' },
      { name: 'credits2020', label: '2020 Project Credits' },
      { name: 'credits2021', label: '2021 Project Credits' },
      { name: 'credits2022', label: '2022 Project Credits' },
      { name: 'credits2023', label: '2023 Project Credits' },
      { name: 'credits2024', label: '2024 Project Credits' },
      { name: 'existingCredits', label: 'Existing Carbon Credits' },
      {
        name: 'estimatedEmissionsReduction',
        label: 'Estimated Annual Emissions Reduction',
      },
    ],
  },
  {
    name: 'Pricing Information',
    fields: [
      { name: 'price', label: 'Price per Credit' },
      { name: 'totalPrice', label: 'Total Price' },
    ],
  },
];

interface ClaimTopic {
  key: string;
  displayName: string;
  id: string;
  topic: string;
}

interface NftRecordDetailProps {
  TablesData?: TableData[];
  handleMint?: () => void;
  handleBack?: () => void;
  data: {
    [key: string]: string | string[] | ClaimTopic[];
  };
  detailView?: boolean;
}

const generateSvgIcon = (color: string) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='100%'
      height='100%'
      viewBox='0 0 560 560'>
      <defs>
        <linearGradient
          id={`gradient-${color}`}
          x1='0%'
          y1='0%'
          x2='0%'
          y2='100%'>
          <stop offset='0%' stopColor={color} stopOpacity='1' />
          <stop offset='100%' stopColor='#003366' stopOpacity='1' />
        </linearGradient>
      </defs>
      <rect width='560' height='560' rx='15' fill={`url(#gradient-${color})`} />
      <text
        x='50%'
        y='50%' // Adjusted to bring text to vertical center
        fontFamily='Arial, sans-serif'
        fontWeight='bold'
        fontSize='300' // Increased font size to make "KC" bigger
        fill='white'
        dominantBaseline='middle'
        textAnchor='middle'>
        KC
      </text>
    </svg>
  );
};  

const NftRecordDetail = ({
  TablesData = [],
  handleMint,
  handleBack,
  data,
  detailView = false,
}: NftRecordDetailProps) => {
  console.log(data);
  const color = hashToColor(`${data['nftTitle'] as string}`);
  const router = useRouter();
  const { transactionHash } = data;
  const title = detailView
    ? `Carbon Credit - ${data['nftTitle']}`
    : 'Preview Carbon Credit Token </>';
  const backButton = (
    <Button onClick={() => router.back()} type='text' icon={<LeftOutlined />} />
  );

  console.log(data);

  const tokenDetails = (
    <div className='space-y-4 mb-2'>
      {fieldGroups.map((fieldGroup, index) => (
        <div key={`group-${index}`}>
          <div className='p-2 font-bold'>{fieldGroup.name}</div>
          <div className='grid grid-cols-2 border-t border-b border-nomyx-gray4-light dark:border-nomyx-gray4-dark'>
            {fieldGroup.fields.map(
              (field: NftRecordDetailField, index: number) => (
                <>
                  {data[field.name] && (
                    <div
                      key={`field-${index}`}
                      className='p-2 border-b odd:border-r last:border-0 odd:[&:nth-last-child(2)]:border-b-0  border-nomyx-gray4-light dark:border-nomyx-gray4-dark'>
                      <div className='text-nomyx-gray3-light dark:text-nomyx-gray3-dark'>
                        {field.label}
                      </div>
                      <div className='card-value truncate'>
                        {data[field.name] as string}
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Card
        className='bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark text-nomyx-text-light dark:text-nomyx-text-dark'
        title={detailView ? [backButton, title] : title}
        styles={{ body: { padding: '0' } }}
        extra={
          <Button
            onClick={() =>
              window.open(
                `https://sepolia.etherscan.io/tx/${
                  transactionHash ? transactionHash : ''
                }`
              )
            }
            className='flex items-center gap-2 text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent'>
            <ShareIcon />
            View On Block Explorer
          </Button>
        }>
        <div className='flex flex-col mb-4'>
          <div className='font-bold p-2'>Details</div>
          <div className='flex gap-4 px-2'>
            <div className='flex items-center justify-center h-52 w-52'>
              {generateSvgIcon(color)}
            </div>
            <div className='p-4 py-8'>
              <h1 className='text-3xl font bold'>
                {data['nftTitle'] as string}
              </h1>
              <p className='!text-nomyx-gray1-light dark:!text-nomyx-gray1-dark'>
                {data['description'] as string}
              </p>
            </div>
          </div>
        </div>

        {detailView && (
          <>
            <Tabs defaultActiveKey='1'>
              <TabPane tab='Token Details' key='1'>
                {tokenDetails}
              </TabPane>

              {TablesData.map((tableData: TableData, index: number) => {
                return (
                  <TabPane
                    key={index + 2}
                    tab={
                      <>
                        <div className='mr-2 inline-block'>
                          {React.isValidElement(tableData.headerImage) ? (
                            tableData.headerImage
                          ) : (
                            <Image
                              alt=''
                              src={tableData.headerImage as string}
                              height={10}
                              width={20}
                              className='inline-block'
                            />
                          )}
                        </div>

                        {tableData.label}
                      </>
                    }>
                    <Table
                      rowKey='id'
                      dataSource={tableData.tableData}
                      columns={tableData.columns}
                    />
                  </TabPane>
                );
              })}
            </Tabs>
          </>
        )}

        {!detailView && tokenDetails}
        {!detailView && (
          <>
            <div className='p-2 font-bold'>Compliance Features</div>
            <div className='mb-2 p-2 border-t border-nomyx-gray4-light dark:border-nomyx-gray4-dark'>
              {(data['claimTopics'] as ClaimTopic[])
                .filter((topic) =>
                  (data['targetKeys'] as string[]).includes(topic['key'])
                )
                .map((topic, index) => (
                  <div key={`claim-${index}`}>
                    <Checkbox defaultChecked disabled>
                      <p>
                        {topic.displayName} ({topic.topic})
                      </p>
                    </Checkbox>
                  </div>
                ))}
            </div>
          </>
        )}
      </Card>

      {!detailView && (
        <>
          <div className='w-full flex justify-end gap-4 pt-2'>
            <Button
              className='text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent'
              onClick={handleBack}>
              Back
            </Button>
            <Button
              className='bg-nomyx-blue-light mr-4 hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark'
              onClick={handleMint}>
              Mint
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default NftRecordDetail;
