import React from 'react';

export default function SkinWrapper({ children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Linen background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url("/skins/linen-background.jpg")',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundColor: '#f8f5e4',
        }}
      />

      {/* Content wrapper with faux frame using image */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          minHeight: '100vh',
          padding: 'clamp(3rem, 8vw, 6rem)',
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}