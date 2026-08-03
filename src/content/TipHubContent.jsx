import { createContext, useContext } from "react";
import { fallbackContent } from "./fallbackContent";

const TipHubContentContext = createContext({
  content: fallbackContent,
});

export function TipHubContentProvider({ children }) {
  return (
    <TipHubContentContext.Provider
      value={{ content: fallbackContent }}
    >
      {children}
    </TipHubContentContext.Provider>
  );
}

export function useTipHubContent() {
  return useContext(TipHubContentContext);
}
