import React from 'react';
import { Button, Card, Checkbox } from 'antd';

import { useRouter } from 'next/router';
import { ShareIcon } from '@/assets';
import { LeftOutlined } from '@ant-design/icons';
import { hashToColor } from '@/utils/colorUtils';
import { NFT_RECORD_FIELD_GROUPS } from '@/utils/constants';
import { GenerateSvgIcon } from './KronosCreditSVG';


const fieldGroups: NftRecordDetailFieldGroup[] = NFT_RECORD_FIELD_GROUPS

interface NftRecordDetailProps {
  handleMint?: () => void;
  handleBack?: () => void;
  data: {
    [key: string]: string | string[] | ClaimTopic[];
  };
  detailView?: boolean;
}

const NftRecordDetail = ({
  handleMint,
  handleBack,
  data,
  detailView = false,
}: NftRecordDetailProps) => {
  console.log(data);
  const colorKey = data['id'] || data['nftTitle'];
  const color = hashToColor(`${colorKey as string}`);
  const router = useRouter();
  const { transactionHash, allTopics, claimTopics } = data;
  const title = detailView
    ? `Carbon Credit - ${data['nftTitle']}`
    : 'Preview Carbon Credit Token </>';
  const backButton = (
    <Button onClick={() => router.back()} type='text' icon={<LeftOutlined />} />
  );

  return (
    <>
      <Card
        className='bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark text-nomyx-text-light dark:text-nomyx-text-dark'
        title={detailView ? [backButton, title] : title}
        styles={{ body: { padding: '0' } }}
        /*extra={
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
        } */
        > 
        <div className='flex flex-col mb-4'>
          <div className='font-bold p-2'>Details</div>
          <div className='flex gap-4 px-2'>
            <div className='flex items-center justify-center h-52 w-52'>
              <GenerateSvgIcon color={color} />
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

        <div className='p-2 font-bold'>Compliance Features</div>
        <div className='mb-2 p-2 border-t border-nomyx-gray4-light dark:border-nomyx-gray4-dark'>
          {(allTopics as ClaimTopic[])
            .filter((topic) =>
              (claimTopics as string).split(',').includes(topic['key'])
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
