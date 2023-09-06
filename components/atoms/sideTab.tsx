import Link from 'next/link'
import React from 'react'

const SideTab = ({icon, label, href}: any) => {
  return (
    <div className='flex gap-4'>
      {icon && icon}
      <Link href={href}>{label}</Link>
    </div>
  )
}

export default SideTab