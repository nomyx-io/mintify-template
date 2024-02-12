import React from 'react'
import {Button, Card, Table, Tabs} from 'antd';

import { useRouter } from 'next/router'
import { LeftArrowIcon, ShareIcon } from '@/assets'
import {LeftOutlined} from "@ant-design/icons";
import ReadOnlyField from "@/components/ReadOnlyField";
import Image from "next/image";
import {CustomTable} from "@/components/molecules/Table";

const TabPane = Tabs.TabPane;

const topFields: any = [
    {name: 'mintAddress', label: 'Mint Address'},
    {name: 'description', label: 'Description'}
];

const fields: any = [
    {name: 'nftTitle', label: 'Name', align: 'center', sortable: true },
    {name: 'loanId', label: 'Loan Id', align: 'center', sortable: true },
    { name: 'originationDate', label: 'Origination Date', align: 'center' },
    { name: 'currentValue', label: 'Current Value', align: 'center', sortable: true },
    { name: 'loanAmount', label: 'Origination Amount', align: 'center', sortable: true },
    { name: 'monthly', label: 'Monthly Amount', align: 'center' },
    { name: 'term', label: 'Term', align: 'center' },
    { name: 'yields', label: 'Interest Rate', align: 'center' },
    { name: 'discount', label: 'Discount', align: 'center' },
    { name: 'ficoScore', label: 'Fico', align: 'center' },
    { name: 'location', label: 'Location of Issuance', align: 'center' },
    { name: 'freeze', label: 'Frozen', align: 'center' }
];

const gridStyle: React.CSSProperties = {
    textAlign: 'center'

};

const NftRecordDetail = ({ id, TablesData = [], handleMint, handleBack, data, detailView = false }: any) => {

    const router = useRouter()
    const { nftTitle, transactionHash, image } = data;
    const title = detailView ? `NBT - ${data["nftTitle"]}` : 'Preview NBT</>';
    const backButton = (<Button onClick={() => router.back()} type="text" icon={<LeftOutlined/>} />);

    console.log(data);

    const tokenDetails = (
        <Card>
            {fields.map((field: any, index: number) => (
                <Card.Grid
                    key={`field-${index}`}

                    className="grid-cols-1"
                >
                    <div className="card-label">{field.label}</div>
                    <div className="card-value text-lg">{data[field.name]}</div>

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

                        {topFields.map((field: any, index: number) => (
                            <ReadOnlyField
                                key={`field-${index}`}
                                label={(<span className="card-label">{field.label}</span>)}
                                className="grid-cols-1"
                            >

                                <span className="card-value">{data[field.name]}</span>

                            </ReadOnlyField>
                        ))}

                    </div>
        </Card>
        <Card bodyStyle={{padding: "0"}}>

            {detailView && <>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Token Details" key="1">{tokenDetails}</TabPane>

                    {TablesData.map((relatedList: any, index: any) => {
                        return (
                            <TabPane key={index + 2}
                                     tab={(
                                         <>

                                            <div className="mr-2 inline-block">
                                                {React.isValidElement(relatedList.headerImage) ? (relatedList.headerImage) : (<Image alt="" src={relatedList.headerImage} height={10} width={20} className="inline-block"/>)}
                                            </div>

                                             {relatedList.label}
                                         </>
                                     )}>

                                <Table rowKey="id" dataSource={relatedList.tableData} columns={relatedList.columns}/>

                            </TabPane>)
                    })}


                </Tabs>
            </>}

            {!detailView && tokenDetails}

        </Card>

        <Card title="About LenderLab Tokens">
            <p>LenderLab Yield Generating NBT</p>
            <p className='text-[#871212]'>{`This ra-NBTI asset (Note-Backed Token) entitles you to participation rights in Loan#${data?.loanId || ""} with an origination value of $${data?.loanAmount || ""} with lender qualifier of ${data?.ficoScore || ""} FICO ranking. generating an annual yield ${data?.yield || ""}.It provides a total payout of $${data?.loanAmount || ""} over a term of ${data?.term || ""} months.`}</p>
        </Card>

        {!detailView && <>

            <div className='w-[30%] flex flex-col gap-4'>
                <Button onClick={handleBack}>Back</Button>
                <Button onClick={handleMint}>Mint</Button>
            </div>
        </>}


    </>);
}

export default NftRecordDetail;
