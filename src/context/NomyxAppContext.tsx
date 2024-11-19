import React, { createContext, useState, useContext } from "react";

// Create the context with a default empty value
const NomyxAppContext = createContext({});

export const NomyxAppProvider = ({ children }: { children: React.ReactNode }) => {
  const [blockchainService, setBlockchainService] = useState("");

  return <NomyxAppContext.Provider value={{ blockchainService, setBlockchainService }}>{children}</NomyxAppContext.Provider>;
};

// Export the useWalletAddress hook for easy access to context values
export const useNomyxAppContext = () => useContext(NomyxAppContext);

export default NomyxAppContext;
