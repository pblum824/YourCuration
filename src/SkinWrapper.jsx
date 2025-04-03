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

      {/* Border frame layer - margin creates visual border effect */}
      <div
        style={{
          position: 'fixed',
          inset: 'clamp(3rem, 6vw, 6rem)',
          zIndex: 5,
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          pointerEvents: 'none',
        }}
      />

      {/* Content layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: 'clamp(2rem, 5vw, 5rem)',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </div>
  );
}