// File: DevToggle.jsx
import React from 'react';
import { useDevMode } from './context/DevModeContext';
import { FontSelectorDevPanel } from './FontSelectorDevPanel';

export default function DevToggle({ buttonStyle }) {
  const { devMode, setDevMode } = useDevMode();

  return (
    <>
      <button
        onClick={() => setDevMode(!devMode)}
        style={buttonStyle}
      >
        {devMode ? '🐛 Dev Mode: ON' : '🐛 Dev Mode: OFF'}
      </button>

      {devMode && <FontSelectorDevPanel devMode={true} />}
    </>
  );
}