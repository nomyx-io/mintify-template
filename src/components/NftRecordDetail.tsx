import React, { ReactElement } from 'react'
import {Button, Card, Table, TableColumnType, Tabs} from 'antd';

import { useRouter } from 'next/router'
import { ShareIcon } from '@/assets'
import {LeftOutlined} from "@ant-design/icons";
import Image from "next/image";

const TabPane = Tabs.TabPane;

const topFields: NftRecordDetailField[] = [
    {name: 'mintAddress', label: 'Mint Address'},
    {name: 'description', label: 'Description'}
];

const fields: NftRecordDetailField[] = [
    { name: 'nftTitle', label: 'Name' },
    { name: 'trancheCutoff', label: 'Tranche Cutoff' },
    { name: 'projectName', label: 'Project/Site Name' },
    { name: 'registerId', label: 'Registry Id' },
    { name: 'mintAddress', label: 'Mint to' },
    { name: 'auditor', label: 'Auditor' },
    { name: 'carbonAmount', label: 'Carbon Amount' },
    { name: 'issuanceDate', label: 'Issuance Date' },
    { name: 'description', label: 'Description' },
    { name: 'carbonAmount', label: 'Carbon Amount' },
    { name: 'issuingEntity', label: 'Issuing Entity' },
    { name: 'description', label: 'Description' },
];

interface NftRecordDetailProps {
  TablesData?: TableData[];
  handleMint?: () => void;
  handleBack?: () => void;
  data: {
    [key: string]: string | string[];
  }
  detailView?: boolean;
}

const NftRecordDetail = ({ TablesData = [], handleMint, handleBack, data, detailView = false }: NftRecordDetailProps) => {

    const router = useRouter()
    const { transactionHash } = data;
    const title = detailView ? `NBT - ${data["nftTitle"]}` : 'Preview NBT</>';
    const backButton = (<Button onClick={() => router.back()} type="text" icon={<LeftOutlined/>} />);

    console.log(data);

    const tokenDetails = (
        <Card>
            {fields.map((field: NftRecordDetailField, index: number) => (
                <Card.Grid
                    key={`field-${index}`}

                    className="grid-cols-1 overflow-hidden text-ellipsis"
                >
                    <div className="card-label">{field.label}</div>
                    <div className="card-value truncate">{data[field.name]}</div>

                </Card.Grid>
            ))}
        </Card>
    );

    return (<>

        <Card title={detailView ? [backButton, title] : title}
              extra={(<Button
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionHash ? transactionHash : ''}`)}
                  className='flex items-center gap-2'><ShareIcon/>View On Block Explorer</Button>)}>

                    <div className="grid grid-cols-3 gap-4">

                        {topFields.map((field: NftRecordDetailField, index: number) => (

                              <div key={`field-${index}`} className="grid-cols-1 overflow-hidden text-ellipsis font-[1.3em]">
                                  <p className='text-xs'>
                                      <span className="card-label">{field.label}</span>
                                  </p>
                                  <div className='truncate'>
                                <span className="card-value text-sm">{data[field.name]}</span>
                                  </div>
                              </div>
                        ))}

                    </div>
        </Card>
        <Card styles={{ body: {padding: "0"}}}>

            {detailView && <>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Token Details" key="1">{tokenDetails}</TabPane>

                    {TablesData.map((tableData: TableData, index: number) => {
                        return (
                            <TabPane key={index + 2}
                                     tab={(
                                         <>

                                            <div className="mr-2 inline-block">
                                                {React.isValidElement(tableData.headerImage) ? (tableData.headerImage) : (<Image alt="" src={tableData.headerImage as string} height={10} width={20} className="inline-block"/>)}
                                            </div>

                                             {tableData.label}
                                         </>
                                     )}>

                                <Table rowKey="id" dataSource={tableData.tableData} columns={tableData.columns}/>

                            </TabPane>)
                    })}


                </Tabs>
            </>}

            {!detailView && tokenDetails}

        </Card>

        <Card title="About Kronos Tokens">
            <p>Kronos Yield Generating NBT</p>
            <p className='text-[#871212]'>{`This ra-NBTI asset (Note-Backed Token) entitles you to participation rights in Loan#${data?.loanId || ""} with an origination value of $${data?.loanAmount || ""} with lender qualifier of ${data?.ficoScore || ""} FICO ranking. generating an annual yield ${data?.yield || ""}.It provides a total payout of $${data?.loanAmount || ""} over a term of ${data?.term || ""} months.`}</p>
        </Card>

        {!detailView && <>

            <div className='w-full flex justify-end gap-4 pt-2'>
                <Button onClick={handleBack}>Back</Button>
                <Button onClick={handleMint}>Mint</Button>
            </div>
        </>}


    </>);
}

export default NftRecordDetail;
