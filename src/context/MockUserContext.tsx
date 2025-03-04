import React, { createContext, ReactNode } from "react";

// Create a mock version of the UserContext
export const MockUserContext = createContext({
  role: ["CentralAuthority"], // Mock role to bypass authentication checks
  setRole: () => {},
  walletPreference: null,
  setWalletPreference: () => {},
  dfnsToken: null,
  setDfnsToken: () => {},
  user: { id: "mock-user", username: "Mock User" }, // Mock user data
  setUser: () => {},
});

interface MockUserProviderProps {
  children: ReactNode;
}

export const MockUserProvider: React.FC<MockUserProviderProps> = ({ children }) => {
  return (
    <MockUserContext.Provider
      value={{
        role: ["CentralAuthority"],
        setRole: () => {},
        walletPreference: null,
        setWalletPreference: () => {},
        dfnsToken: null,
        setDfnsToken: () => {},
        user: { id: "mock-user", username: "Mock User" },
        setUser: () => {},
      }}
    >
      {children}
    </MockUserContext.Provider>
  );
};
