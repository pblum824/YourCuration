// File: src/utils/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import DevToggle from '../DevToggle';

const navBtnStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#f3f4f6',
  color: '#1e3a8a',
  cursor: 'pointer',
  flex: '1 1 auto',
  minWidth: '150px',
};

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
  showDevToggle = true,
}) {
  const { mode } = useCuration();
  const fileInputRef = useRef();

  if (mode !== 'artist') return null;

  return (
    <>
      {/* Tier 1: Nav */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.25rem',
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
              ...navBtnStyle,
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
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
          marginTop: '0.75rem',
        }}
      >
        <button
          onClick={() => setView('client')}
          style={{
            ...navBtnStyle,
            backgroundColor: '#e0e7ff',
            minWidth: '150px',
          }}
        >
          🎬 Preview Client Mode
        </button>

        {showDevToggle && (
          <button
            onClick={() => setDevMode(!devMode)}
            style={{
              ...navBtnStyle,
              minWidth: '150px',
              fontSize: '0.85rem',
              opacity: 0.7,
            }}
          >
            {devMode ? '🧠 Dev Mode: ON' : '🧠 Dev Mode: OFF'}
          </button>
        )}
      </div>
      {/* Tier 3: File/Image Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '2rem',
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
            <button onClick={() => fileInputRef.current?.click()} style={navBtnStyle}>
              📥 Import Gallery
            </button>
          </>
        )}
        {showExport && (
          <button onClick={onExport} style={navBtnStyle}>
            📤 Export Gallery
          </button>
        )}
        {onGenerate && (
          <button onClick={onGenerate} style={navBtnStyle}>
            🛠️ Generate Tags
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            style={{ ...navBtnStyle, backgroundColor: '#fee2e2', color: '#b91c1c' }}
          >
            🔄 Reset Dashboard
          </button>
        )}
      </div>
    </>
  );
}