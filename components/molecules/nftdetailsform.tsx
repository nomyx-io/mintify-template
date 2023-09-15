import React from 'react'
import TextInput from '../atoms/textInput'

const NftDetailsForm = ({ fields, handleChange }: any) => {
    return (
        <div className='flex flex-col gap-4 bg-[#f0f0f0] p-4'>
            <p className='font-semibold mb-2'>NFT Details</p>
            {fields.map((field: any) => {
                return (
                    <div className={`${typeof (field.value) == 'object' ? 'flex gap-3' : 'flex-col'}`}>
                        {typeof (field.value) == 'object' ?
                            field.value.map((item: any) => {
                                return (
                                    <div className='flex flex-col gap-1 w-1/2'>
                                        <p>{item.label}</p>
                                        <TextInput handleChange={handleChange} name={item.name} value={item.value} defaultValue={item.defaultValue} placeholder={item.placeHolder} />
                                    </div>
                                )
                            }) :
                            field.value == undefined ? <p className='-mb-4 mt-2'>{field.label}</p> :
                                <div className='flex flex-col gap-1'>
                                    <p>{field.label}</p>
                                    <TextInput handleChange={handleChange} name={field.name} value={field.value} defaultValue={field.defaultValue} placeholder={field.placeHolder} />
                                </div>
                        }
                    </div>)
            })}
        </div>
    )
}

export default NftDetailsForm