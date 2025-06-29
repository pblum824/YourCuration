// File: src/utils/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import { useDevMode } from '../context/DevModeContext';

export default function ControlBar({
  onImport,
  onExport,
  onGenerate,
  onReset,
  devMode,
  setDevMode,
  showImport = true,
  showExport = true,
}) {
  const { mode, setMode } = useCuration();
  const fileInputRef = useRef();

  if (mode !== 'artist') return null;

  return (
    <>
      {/* Tier 2: Mode Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => setMode('client')}
          style={{ ...navButtonStyle, backgroundColor: '#e0e7ff' }}
        >
          🎬 Preview Client Mode
        </button>
        <button
          onClick={() => setDevMode(!devMode)}
          style={navButtonStyle}
        >
          🛠️ Dev Mode: {devMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Tier 3: Image Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          justifyContent: 'center',
        }}
      >
        {showImport && (
          <>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={onImport}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={controlButton}
            >
              📥 Import Gallery
            </button>
          </>
        )}

        {showExport && (
          <button onClick={onExport} style={controlButton}>
            📤 Export Gallery
          </button>
        )}

        {onGenerate && (
          <button onClick={onGenerate} style={controlButton}>
            🛠️ Generate Tags
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            style={{ ...controlButton, backgroundColor: '#fee2e2', color: '#b91c1c' }}
          >
            🔄 Reset Dashboard
          </button>
        )}
      </div>
    </>
  );
}

const navButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '0.5rem',
  border: '1px solid #1e3a8a',
  backgroundColor: '#f3f4f6',
  color: '#1e3a8a',
  cursor: 'pointer',
  minWidth: '150px',
};

const controlButton = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#f3f4f6',
  color: '#1e3a8a',
  cursor: 'pointer',
};