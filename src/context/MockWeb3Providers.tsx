import { createContext, ReactNode } from "react";

export const MockProviderContext = createContext({});

export default function MockProviders({ children }: { children: ReactNode }) {
  return <MockProviderContext.Provider value={{}}>{children}</MockProviderContext.Provider>;
}
