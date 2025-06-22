// File: src/utils/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import DevToggle from '../context/DevModeToggle';

export default function ControlBar({
  onImport,
  onExport,
  onGenerate,
  onReset,
  devMode,
  setDevMode,
  setView,
}) {
  const { mode, setMode } = useCuration();
  const fileInputRef = useRef();

  if (mode !== 'artist') return null;

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

  return (
    <>
      {/* Row 2: Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          justifyContent: 'center',
        }}
      >
        <DevToggle devMode={devMode} setDevMode={setDevMode} />

        <button
          onClick={() => {
            setMode('client');
            setView?.('curated');
          }}
          style={navBtnStyle}
        >
          🎬 Preview Client Mode
        </button>

        {onImport && (
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

        {onExport && (
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