// File: components/DevToggle.jsx
import React from 'react';

export default function DevToggle({ devMode, setDevMode, buttonStyle }) {
  return (
    <button
      onClick={() => setDevMode(!devMode)}
      style={buttonStyle}
    >
      {devMode ? '🐛 Dev Mode: ON' : '🐛 Dev Mode: OFF'}
    </button>
  );
}