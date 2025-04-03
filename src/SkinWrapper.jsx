import React from 'react';

export default function SkinWrapper({ children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Layer 1: linen background */}
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

      {/* Layer 2: full-screen decorative border (no pointer events) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          pointerEvents: 'none',
        }}
      />

      {/* Layer 3: main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          minHeight: '100vh',
          padding: 'clamp(2rem, 5vw, 5rem)',
        }}
      >
        {children}
      </div>
    </div>
  );
}