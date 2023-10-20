import React from 'react'
import { Input } from 'antd'

const TextInput = ({ prefix = null, placeholder, name, value, handleChange, type = "text" }: any) => {
  return (
    <>
      <Input
        className='!border-[#646260] rounded-sm w-full bg-white outline-none blur-nonez-1 input_class p-2'
        placeholder={placeholder}
        name={name}
        value={value}
        type={type}
        prefix={prefix && prefix}
        onChange={handleChange} 
        />
    </>
  )
}

export default TextInput