// File: components/DevToggle.jsx
import React from 'react';
import { useDevMode } from './context/DevModeContext';

export default function DevToggle() {
  const { devMode, setDevMode } = useDevMode();

  return (
    <button
      onClick={() => setDevMode(!devMode)}
      style={{
        padding: '0.5rem 1rem',
        border: '1px solid #1e3a8a',
        backgroundColor: '#f3f4f6',
        color: '#1e3a8a',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        minWidth: '150px',
        height: '42px',
      }}
    >
      {devMode ? '🐛 Dev Mode: ON' : '🐛 Dev Mode: OFF'}
    </button>
  );
}