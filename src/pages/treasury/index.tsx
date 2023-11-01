import { getDashboardLayout } from "@/Layouts";
import { CustomTable } from "@/components/molecules/Table";
import { Button } from "antd";
import React, { useState } from "react";
import { CloseIcon } from "@/assets";
import Papa from "papaparse";
import * as XLSX from 'xlsx'
import moment from "moment";
import { FileUploader } from "react-drag-drop-files";

export const PopupDeposit = ({columns, rows, close, handleAddMakeDeposite,setSelectedDeposite}:any) => {
  return (
    <div className="absolute inset-0 m-auto w-full h-full min-w-lg max-w-3xl max-h-[calc(100vh-20%)] shadow-md bg-white">
      <div className="w-full h-full p-5">
        <div className="flex flex-col justify-between h-full">
                <div className="flex flex-row justify-between items-center">
                    <h1 className="capitalize font-bold text-lg">deposit</h1>
                    <CloseIcon onClick={close} className="w-8 h-fit rounded-full cursor-pointer" />
                </div>
                <p>Are you sure you want to deposit to 57 token balances an amount totalling $696,696?</p>
                <div className="overflow-y-auto h-[300px]">
                    <CustomTable columns={columns as any} data={rows as any} />
                </div>
                <div className="flex flex-row justify-between items-center">
                    <Button
                    onClick={()=>{
                        setSelectedDeposite([])
                        close()
                    }}
                    className="bg-[#637eab] text-white w-fit self-end rounded-none text-2xl h-fit"
                >
                    Cancel
                </Button>
                <Button
                    onClick={()=>{ 
                        handleAddMakeDeposite()
                        setSelectedDeposite([])
                        close()
                    }}
                    className="bg-[#637eab] text-white w-fit self-end rounded-none text-2xl h-fit"
                >
                    Deposit
                </Button>
                </div>
        </div>
      </div>
    </div>
  );
};

const Treasury = () => {

  const [depositeModal, setDepositModal] = useState(false);
  const [makeDeposite,setMakeDeposit] = useState<any[]>([])
  const [selectedDeposit,setSelectedDeposite] = useState<any[]>([])
  const [fileRowData, setFileRowData] = useState<any>([])
  const [fileColumnData, setFileColumnData] = useState<any>([])
  const DateColumn = "Deposit Date"
  const DateFormat = "DD-MM-YYYY"

  function handleAddMakeDeposite(){
    setMakeDeposit([...makeDeposite, ...selectedDeposit])
  }

  const columns = [   
    {       
      key: "_depositDate",
      label: "Deposit date",
      align: "center",
      // render:  ((row: any) => (
      //   <>
      //   <input type="checkBox" name="check" onChange={(e:any)=>{
      //       const {checked} = e.target
      //       let find = selectedDeposit.find((item)=>item.id === row.id)
      //       if(checked && !find){
      //           setSelectedDeposite([...selectedDeposit, row])
      //       }
      //       else{
      //           let modify = selectedDeposit.filter((item:any)=> item.id !== row.id)
      //           setSelectedDeposite(modify)
      //       }
      //   }}  /> {row._depositDate}
      //   </>
      // ))
    },
    { key: "_TokenIds", label: "Token Ids", align: "center" },
    { key: "_amount", label: "Amounts", align: "center" },
    { key: "_total", label: "Total", align: "right" },
  ];


  const rows = [
    {
       id : 1,
      _depositDate: `row item`,
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
    {
        id : 2,
      _depositDate: "row item",
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
    {
        id : 3,
      _depositDate: "row item",
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
    {
        id : 4,
      _depositDate: "row item",
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
    {
        id : 5,
      _depositDate: "row item",
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
    {
        id : 6,
      _depositDate: "row item",
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
    {
        id : 7,
      _depositDate: "row item",
      _TokenIds: "saddwad",
      _amount: 234,
      _total: 2344,
    },
  ];

  function handleOpenModal(){
    setDepositModal(true)
  }

  function handleCloseModal(){
    setDepositModal(false)
  }

  function handleSetDataInTable(data:any){
    let columnData = Object.keys(data[0] as { [key: string]: any })
    let columnModifyData = ["check" , ...columnData].map((keyname:any)=>{
      let _keyname = "_"+keyname.split(" ").join("")      
      if(keyname === "check"){
        return {key: _keyname, label: ``, align: "center", render:  ((row: any) =>
        {          
         return <>
          <input type="checkBox" 
          name="check"          
          onChange={(e:any)=>{            
              const {checked} = e.target
              if(checked){
                setSelectedDeposite(prev => [...prev, row])
              }
              else{                
                setSelectedDeposite(prev => prev.filter((item:any)=>item.__rowNum__ !== row.__rowNum__))
              }
          }}  />
          </>
        })}
      }

      return {key: _keyname, label: keyname, align: "center"}
  })
  setFileColumnData(columnModifyData);

  let rowdata = Object.keys(data[0] as { [key: string]: any })
  rowdata= data.map((objdata:any,idx:any)=>{
    let obj = rowdata.reduce((acc:any,ob:any)=>{
      let _keyname = "_"+ob.split(" ").join("")
      if(ob === DateColumn){
        if(typeof objdata[ob] === "number"){
          let excelDateNumber = objdata[ob];      
          let date = new Date(Date.UTC(1900, 0, excelDateNumber - 1));
          let stringDate = moment(date).format(DateFormat)        
          acc[_keyname] = stringDate
        }
        else{
          acc[_keyname] =  moment(objdata[ob], "DD/MM/YYYY").format(DateFormat)
        }
      }
      else{
        acc[_keyname] = objdata[ob]  
      }          
      return acc
    },{})
    obj["__rowNum__"]  = objdata["__rowNum__"]    
    return obj
  })
    setFileRowData(rowdata)
  }

  const parseXLSX = (file:any) => {   
    const reader = new FileReader();
    reader.onload = (event:any) => {
      const data = event?.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];      
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      handleSetDataInTable(jsonData)
    };
    
    reader.readAsBinaryString(file);
  };
  

  const parseCSV = (file:any) => {   
    Papa.parse(file, {
      complete: function (results) {
        handleSetDataInTable(results.data);
      },
    });
  };

  function handleCscFile(file:any){
    if(makeDeposite.length > 0){
      setMakeDeposit([])
    }    
    if(file?.name.endsWith('.csv')){
      parseCSV(file)
      handleOpenModal()
    }
    else if(file?.name.endsWith('.xlsx')){
      parseXLSX(file)
      handleOpenModal()
    }
    else{
      alert('Please select a valid XLSX file.');
    }
  
  }

  return (
    <>
      <div className="w-full grid grid-cols-4 p-5 gap-x-4">        
        <div className="col-span-3 py-2">
          <div className="w-full bg-[#f0f0f0] flex flex-col p-5">
            <div className="flex flex-col gap-5 h-full ">
              <h1 className="capitalize font-extrabold">make a deposit</h1>
              <div className="w-full flex justify-center">
                <FileUploader
                  handleChange={(file: any) => {
                    handleCscFile(file)
                  }}
                  classes="!w-full"
                  name="file"
                  types={["csv", "xlsx", "xls"]}
                />
              </div>
              {makeDeposite.length > 0 && <div className="flex-grow bg-white h-[300px] overflow-y-auto">
                <CustomTable columns={fileColumnData as any} data={makeDeposite} />
              </div>}
              <Button
                onClick={()=>{}}
                className="bg-[#637eab] text-white w-fit self-end rounded-none"
              >
                Deposit
              </Button>
            </div>
            <div className="h-full flex flex-col gap-5">
              <h1 className="capitalize font-extrabold">historical deposits</h1>
              <div className="flex-grow bg-white h-[300px] overflow-y-auto">
                <CustomTable columns={columns as any} data={rows} />
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-3">
          <select className="border-2 w-full py-2">
            <option>Select Treasury</option>
          </select>
          <div className="w-full bg-[#f0f0f0] p-3">
            <h1 className="font-extrabold text-lg">Treasury: 123</h1>
            <div className="mt-3">
              Tokken Address : 0x0000000000000000000000000
            </div>
            <div className="mt-3">Depositors : 69</div>
            <div className="mt-3">Total Held: $696, 969.00</div>
            <div className="mt-3">Last Deposit: 1/1/1980</div>
            <Button  className="w-full bg-white mt-3">Deposits</Button>
          </div>
        </div>
      </div>
      {depositeModal && 
      <PopupDeposit 
      columns={fileColumnData}  
      rows={fileRowData} 
      close={handleCloseModal} 
      handleAddMakeDeposite={handleAddMakeDeposite}
      setSelectedDeposite={setSelectedDeposite}
      />}
    </>
  );
};
export default Treasury;
Treasury.getLayout = getDashboardLayout;
