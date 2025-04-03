import React from 'react';

export default function SkinWrapper({ children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Full-screen floral border frame */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundColor: '#f8f5e4', // in case image fails
        }}
      />

      {/* Inset content container with linen background */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          margin: 'clamp(3rem, 6vw, 6rem)',
          backgroundImage: 'url("/skins/linen-background.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#fdfaf5', // soft linen fallback
          borderRadius: '1rem',
          padding: 'clamp(2rem, 5vw, 5rem)',
          boxShadow: '0 0 30px rgba(0,0,0,0.05)',
        }}
      >
        {children}
      </div>
    </div>
  );
}