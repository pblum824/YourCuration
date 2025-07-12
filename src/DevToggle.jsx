// File: src/DevToggle.jsx
import React from 'react';
import { useDevMode } from './context/DevModeContext';

export default function DevToggle({ buttonStyle }) {
  const { devMode, setDevMode } = useDevMode();

  return (
    <button
      onClick={() => setDevMode(!devMode)}
      style={{
        ...buttonStyle,
        backgroundColor: devMode ? '#e0e7ff' : '#f3f4f6',
        color: devMode ? '#1e3a8a' : '#4b5563',
      }}
    >
      Dev Mode: {devMode ? 'ON' : 'OFF'}
    </button>
  );
}