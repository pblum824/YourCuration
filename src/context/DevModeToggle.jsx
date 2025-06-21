// File: src/components/DevModeToggle.jsx
import React from 'react';
import { useDevMode } from '../context/DevModeContext';
import { useCuration } from '../YourCurationContext';

export default function DevModeToggle() {
  const { devMode, setDevMode } = useDevMode();
  const { mode } = useCuration();

  if (mode !== 'artist') return null;

  return (
    <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 2000 }}>
      <button
        onClick={() => setDevMode((v) => !v)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          borderRadius: '0.5rem',
          backgroundColor: devMode ? '#c7d2fe' : '#e5e7eb',
          color: '#111',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        DevMode: {devMode ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}