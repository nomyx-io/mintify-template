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

  // Use useEffect with an empty dependency array to ensure it runs only once on mount
  useEffect(() => {
    const getSettings = async () => {
      if (api && api.getSettings) {
        try {
          const settings: { defaultTokenImage: File; walletAddress?: string } =
            await api.getSettings();
          if (settings && settings.walletAddress) {
            setWalletAddress(settings.walletAddress);
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      }
    };
    getSettings();
  }, [api]);

  return (
      <WalletAddressContext.Provider value={{ walletAddress, setWalletAddress }}>
        {children}
      </WalletAddressContext.Provider>
  );
};

// Export the useWalletAddress hook for easy access to context values
export const useWalletAddress = () => useContext(WalletAddressContext);

export default WalletAddressContext;
