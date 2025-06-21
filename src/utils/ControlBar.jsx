// File: src/components/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import DevToggle from './DevToggle';

export default function ControlBar({
  onImport,
  onExport,
  onGenerate,
  onReset,
  devMode,
  setDevMode,
  showDevToggle = true,
  showImport = true,
  showExport = true,
}) {
  const { mode } = useCuration();
  const fileInputRef = useRef();

  if (mode !== 'artist') return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        justifyContent: 'center',
      }}
    >
      {showDevToggle && <DevToggle devMode={devMode} setDevMode={setDevMode} />}

      {showImport && (
        <>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={onImport}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={buttonStyle}>
            📥 Import Gallery
          </button>
        </>
      )}

      {showExport && (
        <button onClick={onExport} style={buttonStyle}>
          📤 Export Gallery
        </button>
      )}

      {onGenerate && (
        <button onClick={onGenerate} style={buttonStyle}>
          🛠️ Generate Tags
        </button>
      )}

      {onReset && (
        <button
          onClick={onReset}
          style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#b91c1c' }}
        >
          🔄 Reset Dashboard
        </button>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  backgroundColor: '#f3f4f6',
  color: '#1e3a8a',
  cursor: 'pointer',
  marginRight: '0.5rem',
};