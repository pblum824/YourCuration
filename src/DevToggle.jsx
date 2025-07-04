// File: components/DevToggle.jsx
import React from 'react';
import { FontSelectorDevPanel } from './FontSelectorDevPanel'; // ✅ font fallback control

export default function DevToggle({ devMode, setDevMode, buttonStyle }) {
  return (
    <>
      <button
        onClick={() => setDevMode(!devMode)}
        style={buttonStyle}
      >
        {devMode ? '🐛 Dev Mode: ON' : '🐛 Dev Mode: OFF'}
      </button>

      {/* ✅ Show font selector only when in dev mode */}
      <FontSelectorDevPanel devMode={devMode} />
    </>
  );
}