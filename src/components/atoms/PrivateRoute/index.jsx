import { Spin } from 'antd';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

function PrivateRoute({ children, onConnect, role, forceLogout, handleForecLogout }) {
  const {disconnect} = useDisconnect()
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount()

  useEffect(() => {
    if (!isConnected && !address) {
      router.push('/login');
    }
    if (isConnected && role.length == 0) {
      onConnect()
    }
  }, [address, isConnected, role]);

  useEffect(() => {
    (isConnected && role.length > 0) && router.push('/home')
  }, [role, isConnected])

  const handleDisconnect = () => {
    disconnect()
    handleForecLogout()
  }

  useEffect(() => {
    forceLogout && handleDisconnect()
  }, [forceLogout])

  return isConnected && role.length == 0 ? <div className='z-50 h-screen w-screen overflow-hidden absolute top-0 left-0 flex justify-center items-center bg-[#00000040]'>
  <Spin />
</div> : children;
}

export default PrivateRoute;
