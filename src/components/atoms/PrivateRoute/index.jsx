import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

function PrivateRoute({ children, onConnected }) {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount()

  useEffect(() => {
    if (!isConnected && !address) {
      router.push('/login');
    }
    onConnected()
  }, [address, isConnected]);

  return isConnecting ? <div>Loading...</div> : children;
}

export default PrivateRoute;
