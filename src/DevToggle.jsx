// File: components/DevToggle.jsx
import React from 'react';

export default function DevToggle({ devMode, setDevMode }) {
  return (
    <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
      <button
        onClick={() => setDevMode(!devMode)}
        style={{ fontSize: '0.75rem', opacity: 0.5 }}
      >
        {devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
      </button>
    </div>
  );
}