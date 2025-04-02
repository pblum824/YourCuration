import React from 'react';

export default function SkinWrapper({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Layer 1: linen background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/skins/linen-background.jpg")',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Layer 2: full-screen edge-frame skin (top layer behind content) */}
      <div
        className="fixed inset-0 z-10 bg-no-repeat bg-cover pointer-events-none"
        style={{
          backgroundImage: 'url("/skins/sample-border.jpg")',
          backgroundSize: '100% 100%',
        }}
      />

      {/* Layer 3: actual content */}
      <div className="relative z-20 p-[clamp(2rem,5vw,5rem)]">
        {children}
      </div>
    </div>
  );
}