// File: src/utils/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import { useDevMode } from '../context/DevModeContext';

export default function ControlBar({
  view,
  setView,
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
      {/* Tier 1: Nav Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          justifyContent: 'center',
        }}
      >
        {[
          { key: 'artist', label: '🎨 Artist Dashboard' },
          { key: 'generate', label: '🛠️ Generate Tags' },
          { key: 'rate', label: '🧪 Sample Rater' },
          { key: 'curated1', label: '🖼️ Gallery 1' },
          { key: 'curated2', label: '🔍 Gallery 2' },
          { key: 'curatedFinal', label: '🏁 Final Gallery' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              ...navButtonStyle,
              backgroundColor: view === key ? '#ede9fe' : '#f3f4f6',
              color: view === key ? '#5b21b6' : '#1e3a8a',
              border: '1px solid #1e3a8a',
              fontWeight: view === key ? 'bold' : 'normal',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tier 2: Mode Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2.25rem',
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
          style={{ ...navButtonStyle, backgroundColor: '#e0e7ff' }}
        >
          🧪 Dev Mode: {devMode ? 'ON' : 'OFF'}
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
            <button onClick={() => fileInputRef.current?.click()} style={controlButton}>
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