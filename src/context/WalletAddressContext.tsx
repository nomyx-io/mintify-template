import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { KronosService } from '@/services/KronosService';

// Create the context with a default empty value
const WalletAddressContext = createContext({
  walletAddress: '',
  setWalletAddress: (address: string) => {}
});

// Create a provider component that encapsulates the state logic
export const WalletAddressProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useMemo(() => KronosService(), []);
  const [walletAddress, setWalletAddress] = useState('');

  return (
      <WalletAddressContext.Provider value={{ walletAddress, setWalletAddress }}>
        {children}
      </WalletAddressContext.Provider>
  );
};

// Export the useWalletAddress hook for easy access to context values
export const useWalletAddress = () => useContext(WalletAddressContext);

export default WalletAddressContext;
