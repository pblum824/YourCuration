// File: src/DevModeContext.js
import { createContext, useContext, useState } from 'react';

const DevModeContext = createContext();

export function DevModeProvider({ children }) {
  const [devMode, setDevMode] = useState(false);
  return (
    <DevModeContext.Provider value={{ devMode, setDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  return useContext(DevModeContext);
}