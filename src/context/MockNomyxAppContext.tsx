import React, { createContext, ReactNode } from "react";

// Create a mock version of the NomyxAppContext
export const MockNomyxAppContext = createContext({
  blockchainService: null,
  setBlockchainService: () => {},
});

interface MockNomyxAppProviderProps {
  children: ReactNode;
}

export const MockNomyxAppProvider: React.FC<MockNomyxAppProviderProps> = ({ children }) => {
  return (
    <MockNomyxAppContext.Provider
      value={{
        blockchainService: null,
        setBlockchainService: () => {},
      }}
    >
      {children}
    </MockNomyxAppContext.Provider>
  );
};
