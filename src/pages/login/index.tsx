
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Spin } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi'


export default function Login() {
    const { address, isConnected, isConnecting } = useAccount()
    const router = useRouter();

    useEffect(() => {
        isConnected && router.push('/')
    }, [isConnected])

    return (
        <div className='relative h-screen w-screen flex overflow-hidden p-0'>
            {isConnecting ?
                <div className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]'>
                <Spin />
            </div>
            :
            <>
            <div className='bg-[#8454a4] max-[550px]:hidden w-1/2 flex flex-col justify-center items-center gap-10'>
                <Image alt="" src={require('../../assets/loginimg.png')} />
                <div className='text-white text-center'>
                    <p className='font-bold text-xl mb-2'>Mintify</p>
                    {/* <p className='font-semibold text-xs'>All your ID information in one place</p> */}
                </div>
            </div>
            <div className='relative max-[550px]:absolute max-[550px]:w-full w-1/2 flex flex-col p-5'>
                <p className='text-right font-bold text-xl'>Mintify <br /></p>
                <div className='flex flex-col justify-center items-center mt-14'>
                    <div className='flex flex-col gap-2 max-[768px]:w-[90%] w-[90%] min-h-[300px] justify-center items-center'>
                        <ConnectButton label='Log in with Wallet' />
                    </div>
                </div>
            </div>
            </>}
        </div>
    )
}
