// File: src/utils/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import DevToggle from '../DevToggle';

const navButtons = [
  { key: 'artist', label: '🎨 Artist Dashboard' },
  { key: 'generate', label: '🛠️ Generate Tags' },
  { key: 'rate', label: '🧪 Sample Rater' },
  { key: 'curated1', label: '🖼️ Gallery 1' },
  { key: 'curated2', label: '🔍 Gallery 2' },
  { key: 'curatedFinal', label: '🏁 Final Gallery' },
];

export default function ControlBar({
  onImport,
  onExport,
  onGenerate,
  onReset,
  devMode,
  setDevMode,
  showImport = true,
  showExport = true,
  showDevToggle = true,
  setView,
}) {
  const { mode } = useCuration();
  const fileInputRef = useRef();
  if (mode !== 'artist') return null;

  return (
    <>
      {/* Tier 1: Navigation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          marginTop: '0rem',
          justifyContent: 'center',
        }}
      >
        {navButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView?.(key)}
            style={navControlButton}
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
          marginBottom: '2rem',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => setView?.('client')}
          style={{ ...navControlButton, backgroundColor: '#e0e7ff' }}
        >
          🎬 Preview Client Mode
        </button>
        {showDevToggle && (
          <DevToggle devMode={devMode} setDevMode={setDevMode} buttonStyle={navControlButton} />
        )}
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
            <button onClick={() => fileInputRef.current?.click()} style={navControlButton}>
              📥 Import Gallery
            </button>
          </>
        )}

        {showExport && (
          <button onClick={onExport} style={navControlButton}>
            📤 Export Gallery
          </button>
        )}

        {onGenerate && (
          <button onClick={onGenerate} style={navControlButton}>
            🛠️ Generate Tags
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            style={{ ...navControlButton, backgroundColor: '#fee2e2', color: '#b91c1c' }}
          >
            🔄 Reset Dashboard
          </button>
        )}
      </div>
    </>
  );
}

const navControlButton = {
  padding: '.5rem 1rem',
  fontSize: '0.9rem',
  borderRadius: '0.5rem',
  border: '1px solid #1e3a8a',
  backgroundColor: '#f3f4f6',
  color: '#1e3a8a',
  cursor: 'pointer',
  minWidth: '150px',
  textAlign: 'center',
  flex: '0 1 auto',   // ✅ allow to shrink a bit if needed
  lineHeight: '1.2',  // ✅ avoids vertical stretching
};