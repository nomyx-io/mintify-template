import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import bg from '../../assets/LenderLabSplashMetal.png'
import logo from '../../assets/LenderLabLogo.svg'
import styles from './login.module.scss';

export default function Login() {

    return (
        <div className='relative h-screen w-screen flex overflow-hidden p-0'>
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
        </div>
    )
}
