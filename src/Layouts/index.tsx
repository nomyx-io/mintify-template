
import Sidebar from '@/components/molecules/SideNavBar';
import Topnavbar from '@/components/molecules/TopNavBar';
import React from 'react'

export const Layout = ({ children }: any) => {
    return (
        <div className='flex h-full w-full max-h-screen overflow-hidden'>
            <Sidebar />
            <div className='w-full'>
                <div className='w-full'>
                    <Topnavbar />
                </div>
                <div className='p-5 overflow-y-auto h-[calc(100%-80px)]'>
                    {children}
                </div>
            </div>
        </div>
    )
}
export const getDashboardLayout = (page: React.ReactElement) =>
    <Layout>{page}</Layout>;
