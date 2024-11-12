import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Transfer, Card } from 'antd';
import BlockchainService from '@/services/BlockchainService';

interface ComplianceProps {
  selectedClaims: string[];
  setSelectedClaims: Dispatch<SetStateAction<string[]>>;
}

const Compliance = ({ selectedClaims, setSelectedClaims }: ComplianceProps) => {
  const [claimTopics, setClaimTopics] = useState<ClaimTopic[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>(selectedClaims);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const service = BlockchainService.getInstance();

  const getClaimTopics = useCallback(async () => {
    const claims: Parse.Object[] | null | undefined =
      service && (await service.getClaimTopics());
    if (claims) {
      const data: ClaimTopic[] = claims.map((item: Parse.Object) => {
        return {
          key: `${parseInt(item.attributes.topic)}`,
          displayName: item.attributes.displayName as string,
          id: item.id as string,
          topic: item.attributes.topic as string,
        };
      });
      setClaimTopics(data);
    } else {
      //set dummy data
      setClaimTopics([
        {
          key: '1',
          displayName: 'Claim 1',
          topic: '1',
          id: '1',
        },
        {
          key: '2',
          displayName: 'Claim 2',
          topic: '2',
          id: '2',
        },
        {
          key: '3',
          displayName: 'Claim 3',
          topic: '3',
          id: '3',
        },
      ]);
    }
  }, [service]);

  useEffect(() => {
    getClaimTopics();
  }, [getClaimTopics]);

  // This function is called when the user moves a claim from the source list to the target list
  const onChange: TransferOnChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
    setSelectedClaims(nextTargetKeys);
  };

  // This function is called when the user selects a claim from either the source or target list
  const onSelectChange: TransferOnSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  return (
    <Card
      title={
        <span className='text-nomyx-text-light dark:text-nomyx-text-dark'>
          {' '}
          {'Compliance Features'}
        </span>
      }
      className='bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark overflow-hidden'>
      <Transfer
        dataSource={claimTopics}
        titles={['Available Claims', 'Selected Claims']}
        showSelectAll={false}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={onChange}
        onSelectChange={onSelectChange}
        render={(item) => (
          <div>
            {item?.displayName}({item.topic})
          </div>
        )}
        className='overflow-x-scroll md:overflow-auto'
      />
    </Card>
  );
};

export default Compliance;
