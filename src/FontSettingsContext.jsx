import React, { createContext, useContext, useState } from 'react';

const FontSettingsContext = createContext();

export function FontSettingsProvider({ children }) {
  const [selectedFont, setSelectedFont] = useState('Times New Roman, serif'); // ✅ updated fallback

  return (
    <FontSettingsContext.Provider value={{ selectedFont, setSelectedFont }}>
      {children}
    </FontSettingsContext.Provider>
  );
}

export function useFontSettings() {
  return useContext(FontSettingsContext);
}