import React from 'react'
import { Input } from '../../material-tailwind'

const TextInput = ({placeholder, name, value, handleChange}: any) => {
  return (
    <>
        <Input 
          className='!border-[#646260] rounded-sm w-full bg-white outline-none blur-none' 
          labelProps={{className: 'before:mr-0 after:ml-0 hidden'}}
          placeholder={placeholder}  
          name={name}
          value={value}
          onChange={handleChange}
        />
    </>
  )
}

export default TextInput