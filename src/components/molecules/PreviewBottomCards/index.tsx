import Image from 'next/image'
import React from 'react'
import { CustomTable } from '../Table'

const Previewbottomcards = ({TablesData}: any) => {
  return (
    <div className='w-full flex flex-col gap-8 mt-10'>
    {TablesData.map((item: any)=>{return(
          <div>
              <p className='p-2 border border-[#c0c0c0] rounded flex gap-1'>
                  <Image alt="" src={item.headerImage} height={10} width={20} />
                  {item.label}
              </p>
              {item?.tableData.length > 0 ?
                  <div className='-mt-4'>
                      <CustomTable data={item.tableData} columns={item.columns} />
                  </div>
                  :
                  <div className='border border-[#c0c0c0] p-8 flex flex-col gap-2 justify-center items-center text-center'>
                      <Image alt="" src={require('../../../assets/offers.png')} />
                      {item.noDataText}
                  </div>}
          </div>)})}
</div>
  )
}

export default Previewbottomcards