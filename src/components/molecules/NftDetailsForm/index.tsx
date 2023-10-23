import TextInput from '@/components/atoms/TextInput'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import React from 'react'

const NftDetailsForm = ({ fields, frozen, handleChange, handleFreeze }: any) => {
    return (
        <div className='flex flex-col gap-4 bg-[#f0f0f0] p-4'>
            <p className='font-semibold mb-2'>NBT Details</p>
            {fields.map((field: any) => {
                return (
                    <div key={field.name} className={`${typeof (field.value) == 'object' ? 'flex gap-3' : 'flex-col'}`}>
                        {typeof (field.value) == 'object' ?
                            field.value.map((item: any) => {
                                return (
                                    <div key={item.name} className='flex flex-col gap-1 w-1/2'>
                                        <p>{item.label}</p>
                                        <TextInput prefix={item?.prefix || null} type={item.dataType} handleChange={handleChange} name={item.name} value={item.value} defaultValue={item.defaultValue} placeholder={item.placeHolder} />
                                    </div>
                                )
                            }) :
                            field.value == undefined ? <p className='-mb-4 mt-2'>{field.label}</p> :
                                <div className='flex flex-col gap-1'>
                                    <p>{field.label}</p>
                                    <TextInput prefix={field?.prefix || null} type={field.dataType} handleChange={handleChange} name={field.name} value={field.value} defaultValue={field.defaultValue} placeholder={field.placeHolder} />
                                </div>
                        }
                    </div>)
            })}
            <Checkbox onChange={handleFreeze} value={frozen}>Freeze</Checkbox>
        </div>
    )
}

export default NftDetailsForm
