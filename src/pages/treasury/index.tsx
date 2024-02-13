import {getDashboardLayout} from "@/Layouts";
import { Table, Card, Modal} from "antd";
import React, {useEffect, useState} from "react";
import Papa from "papaparse";
import * as XLSX from 'xlsx'
import moment from "moment";
import {FileUploader} from "react-drag-drop-files";
import {toast} from "react-toastify";
import {LenderLabService} from "@/services/LenderLabService";
import styles from "./Treasury.module.scss";
import {formatUnits} from "ethers";

const Treasury = () => {

    const [depositModal, setDepositModal] = useState(false);
    const [makeDeposit, setMakeDeposit] = useState<any[]>([]);
    const [depositHistory, setDepositHistory] = useState<any[]>([]);
    const [hudData, setHudData] = useState<any>({});
    const [selectedDeposit, setSelectedDeposit] = useState<any[]>([]);
    const [fileRowData, setFileRowData] = useState<any>([]);
    const [fileColumnData, setFileColumnData] = useState<any>([]);
    const DateColumn = "Deposit Date"
    const DateFormat = "DD-MM-YYYY";
    const api = LenderLabService();

    function handleSendDeposit() {
        toast.promise(
            async () => {
                try {

                    let result = await api.deposit(fileRowData);

                } catch (e) {
                    console.log(e);
                    throw e;
                }

            },
            {
                pending: 'Sending deposit...',
                success: 'Successfully made deposit',
                error: {
                    render({data}: any) {
                        return <div>{data?.reason || 'An error occurred while making the deposit'}</div>
                    }
                }
            });
    }

    const depositHistoryColumns: any = [
        {dataIndex: "objectId", title: "Id", width:150},
        {dataIndex: ["transactionHash"], title: "Tx Hash", width:500, ellipsis: true},
        {dataIndex: "createdAt", title: "Created Date", width:230},
        {dataIndex: ["totalAmount"], title: "Total", align: "right"}
    ];

    const tokenDepositColumns:any = [
        {dataIndex: "objectId", title: "Id", width:150},
        {dataIndex: ["token", "tokenId"], title: "Token", width:100},
        {dataIndex: ["amount"], title: "Amount", align: "right"}
    ];

    function handleOpenModal() {
        setDepositModal(true);
    }

    function handleCloseModal() {
        setDepositModal(false);
    }

    function handleSetDataInTable(data: any) {
        let columnData = Object.values(data[0] as { [key: string]: any })
        let columnModifyData = ["check", ...columnData].map((keyname: any) => {
            let _keyname = "_" + keyname.split(" ").join("")
            if (keyname === "check") {
                return {
                    key: _keyname, title: ``, align: "center", render: ((row: any, index: number) => {
                        return <>
                            <input
                                key={`input-${index}`}
                                type="checkBox"
                                   name="check"
                                   onChange={(e: any) => {
                                       const {checked} = e.target
                                       if (checked) {
                                           setSelectedDeposit(prev => [...prev, row])
                                       } else {
                                           setSelectedDeposit(prev => prev.filter((item: any) => item.__rowNum__ !== row.__rowNum__))
                                       }
                                   }}/>
                        </>
                    })
                }
            }

            return {key: keyname, dataIndex:keyname, title: keyname, align: "center"}
        });

        setFileColumnData(columnModifyData);

        let columns = Object.values(data[0] as { [key: string]: any });

        data = data.slice(1).map((r:any) => {
            let isEmpty = true;
            let obj:any = {};
            for (let i=0; i<columns.length; i++) {
                const key = columns[i];

                if (!r[i]) {
                    obj[key] = null;  // or a default value
                } else if (r[i] !== '' && r[i] !==  null && r[i] !== undefined) {
                    // obj[key] = parseInt(r[i]);
                    obj[key] = r[i];
                    isEmpty = false;
                }
            }
            return isEmpty ? null : obj;
        })
            .filter((r:any) => r !== null);

        /*rowData = data.map((objdata: any, idx: any) => {
            let obj = rowData.reduce((row: any, key: any) => {
                let _keyname = "_" + key.split(" ").join("")
                if (key === DateColumn) {
                    if (typeof objdata[key] === "number") {
                        let excelDateNumber = objdata[key];
                        let date = new Date(Date.UTC(1900, 0, excelDateNumber - 1));
                        let stringDate = moment(date).format(DateFormat)
                        row[_keyname] = stringDate
                    } else {
                        row[_keyname] = moment(objdata[key], "DD/MM/YYYY").format(DateFormat)
                    }
                } else {
                    row[_keyname] = objdata[key]
                }
                return row;
            }, {})
            obj["__rowNum__"] = objdata["__rowNum__"]
            return obj
        });*/

        setFileRowData(data);
    }

    const parseXLSX = (file: any) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
            const data = event?.target?.result;
            const workbook = XLSX.read(data, {type: 'binary'});
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            handleSetDataInTable(jsonData)
        };

        reader.readAsBinaryString(file);
    };


    const parseCSV = (file: any) => {
        Papa.parse(file, {
            complete: function (results) {
                handleSetDataInTable(results.data);
            },
        });
    };

    function handleFile(file: any) {
        if (file?.name.endsWith('.csv')) {
            parseCSV(file);
            handleOpenModal();
        } else if (file?.name.endsWith('.xlsx')) {
            parseXLSX(file);
            handleOpenModal();
        } else {
            alert('Please select a valid XLSX file.');
        }
    }

    const [tokenDeposits, setTokenDeposits] = useState<any[]>([]);

    const depositExpand = (record: any, index: number, indent: number, expanded: boolean)=> {

        if(expanded){
            if(!record.tokenDeposits){
                api.getTokenDepositsForDepositId(record.objectId).then((tokenDeposits:any)=> {
                    record.tokenDeposits = tokenDeposits;
                    setTokenDeposits(record.tokenDeposits);
                });
            }else{
                setTokenDeposits(record.tokenDeposits);
            }

            return (
                <Table rowKey="objectId" columns={tokenDepositColumns} dataSource={record.tokenDeposits} pagination={false}></Table>
            );
        }

        return null;
    };

    useEffect(() => {
        async function getData() {

            let hudData = await api.getTreasuryData();
            setHudData(hudData);
            let depositHistory:any = await api.getDeposits();
            setDepositHistory(depositHistory);
        }

        getData();

    }, []);

    return (
        <>
            <div className="w-full grid grid-cols-4 gap-4">

                <div className="col-span-3 grid gap-3">

                    <Card title="Make a Deposit">

                        <div className="w-full flex justify-center">
                            <FileUploader
                                handleChange={(file: any) => {
                                    handleFile(file)
                                }}
                                classes="!w-full"
                                name="file"
                                types={["csv", "xlsx", "xls"]}
                            />
                        </div>

                        {makeDeposit.length > 0 && <div className="flex-grow bg-white h-[300px] overflow-y-auto">
                            <Table columns={fileColumnData} dataSource={makeDeposit}/>
                        </div>}

                    </Card>

                    <Card title="Deposit History" bodyStyle={{padding: "0"}}>
                        <Table
                            rowKey="objectId"
                            columns={depositHistoryColumns}
                            dataSource={depositHistory}
                            style={{borderRadius:0}}
                            expandable={{expandedRowRender:depositExpand, indentSize:0}}
                        />
                    </Card>

                </div>
                <Card title="Treasury Info" className="col-span-1">
                    <div className="mt-3">Deposits : {hudData.depositCount}</div>
                    <div className="mt-3">Total Held: {hudData.depositTotal}</div>
                    <div className="mt-3">Last Deposit: {hudData.latestDepositDate}</div>
                    <div className="mt-3">Treasury Address: {hudData.treasuryAddress}</div>
                </Card>
            </div>


            <Modal title="Create Deposit" open={depositModal} width={1000} bodyStyle={{height: 570, justifyContent:"reset"}}
                   onCancel={() => {
                       setSelectedDeposit([]);
                       handleCloseModal();
                   }}
                   onOk={() => {
                        handleSendDeposit();
                        setSelectedDeposit([]);//reset value
                        handleCloseModal();
                   }}>

                <div className="flex flex-col justify-between h-full">
                    <p>Are you sure you want to deposit to 57 token balances an amount totalling $696,696?</p>
                    <Table columns={fileColumnData} dataSource={fileRowData} scroll={{ y: 440 }} className={styles.modalTable} pagination={false}/>
                </div>
            </Modal>
        </>
    );
};
export default Treasury;
Treasury.getLayout = getDashboardLayout;
