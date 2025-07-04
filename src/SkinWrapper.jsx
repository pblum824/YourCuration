import React from 'react';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';
import { useCuration } from './YourCurationContext';

export default function SkinWrapper({ children }) {
  const { selectedFont } = useFontSettings();
  const { mode } = useCuration();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Full-screen floral frame */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundColor: '#f8f5e4',
        }}
      />

      {/* Responsive linen placemat */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(90vw, 1100px)',
          margin: 'clamp(2rem, 5vw, 4rem) auto',
          backgroundImage: 'url("/skins/linen-background.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#fdfaf5',
          borderRadius: '1rem',
          padding: 'clamp(2rem, 5vw, 5rem)',
          boxShadow: '0 0 30px rgba(0,0,0,0.05)',
          ...getFontStyle(mode, { selectedFont }) // ✅ Apply font to inner wrapper
        }}
      >
        {children}
      </div>
    </div>
  );
}