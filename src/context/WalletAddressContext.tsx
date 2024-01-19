import React, { createContext, useState, useContext, useEffect } from 'react';
import { ApiHook } from '@/services/api';

// Create the context with a default empty value
const WalletAddressContext = createContext({
  walletAddress: '',
  setWalletAddress: (address: string) => {}
});

// Create a provider component that encapsulates the state logic
export const WalletAddressProvider = ({ children }: { children: React.ReactNode }) => {
  const api = ApiHook();
  const [walletAddress, setWalletAddress] = useState('');

  const getSettings = async () => {
    if (api && api.getSettings) {
      try {
        const settings: any = await api.getSettings();
        if (settings && settings.walletAddress) {
          setWalletAddress(settings.walletAddress);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }
  };

  // Use useEffect with an empty dependency array to ensure it runs only once on mount
  useEffect(() => {
    getSettings();
  }, []);

  return (
      <WalletAddressContext.Provider value={{ walletAddress, setWalletAddress }}>
        {children}
      </WalletAddressContext.Provider>
  );
};

// Export the useWalletAddress hook for easy access to context values
export const useWalletAddress = () => useContext(WalletAddressContext);

export default WalletAddressContext;
