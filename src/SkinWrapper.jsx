import React from 'react';

export default function SkinWrapper({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Layer 1: linen background (debug red border) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed border-4 border-red-500"
        style={{
          backgroundImage: 'url("/skins/linen-background.jpg")',
          backgroundAttachment: 'fixed',
          backgroundColor: '#f8f5e4',
          minHeight: '100vh',
        }}
      />

      {/* Layer 2: full-screen decorative border (no pointer events) */}
      <div
        className="fixed inset-0 z-10 bg-no-repeat bg-cover pointer-events-none border-2 border-blue-400"
        style={{
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundSize: '100% 100%',
        }}
      />

      {/* Layer 3: main content */}
      <div className="relative z-20 p-[clamp(2rem,5vw,5rem)]">
        {children}
      </div>
    </div>
  );
}