import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Spin } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi'

import bg from '../../assets/LenderLabSplashMetal.png'
import logo from '../../assets/LenderLabLogo.svg'

import styles from './login.module.scss';

export default function Login({onConnect, role, onDisconnect, forceLogout}:any) {
    const { address, isConnected, isConnecting } = useAccount()
    const {disconnect} = useDisconnect()
    const router = useRouter();

    useEffect(() => {
        (isConnected && role.length) > 0 && router.push('/')
    }, [role])

    useEffect(() => {
        forceLogout && disconnect()
      }, [forceLogout])

    return (
        <div className='relative h-screen w-screen flex overflow-hidden p-0'>
            {isConnected && role.length == 0 ?
                <div className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]'>
                <Spin />
            </div>
            :
            <>
            <div className='bg-black max-[550px]:hidden w-1/2 flex flex-col justify-center items-center gap-10'  style={{ backgroundImage: `url(${bg.src})`, backgroundSize: 'cover', backgroundPosition:'center'}}>

                <Image alt="" src={logo} />

                <div className='text-white text-center'>
                    {/*<p className='font-bold text-xl mb-2'>Mintify</p>*/}
                    {/* <p className='font-semibold text-xs'>All your ID information in one place</p> */}
                </div>
            </div>
                <div className='max-[550px]:hidden w-1/2 flex flex-col justify-center items-center p-2'>
                    <div className='text-right font-bold text-xl w-full'>
                        NBT MANAGER
                    </div>
                    <div className={styles.btnContainer + " flex flex-grow justify-center items-center align-middle"}>
                        <ConnectButton label='Log in with Wallet' />
                    </div>
                </div>

            </>}
        </div>
    )
}
