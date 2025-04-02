import React from 'react';

export default function SkinWrapper({ children }) {
  return (
    <div
      className="min-h-screen w-full fixed inset-0 z-0 bg-cover bg-center"
      style={{
        backgroundImage: 'url("/skins/linen-background.jpg")',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="relative z-10 bg-center bg-no-repeat bg-contain"
        style={{
          padding: 'clamp(2rem, 5vw, 5rem)',
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}