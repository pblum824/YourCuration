// File: src/utils/ControlBar.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useCuration } from '../YourCurationContext';
import DevToggle from '../DevToggle';
import { getFontStyle } from '../utils/fontUtils';
import { useFontSettings } from '../FontSettingsContext';

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
  showImport = true,
  showExport = true,
  showDevToggle = true,
  setView,
  onPreviewClient,
}) {
  const { mode } = useCuration();
  const { selectedFont } = useFontSettings();
  const fileInputRef = useRef();
  const [canPresent, setCanPresent] = useState(false);

  useEffect(() => {
    const hasBundle = !!localStorage.getItem('yourcuration_readyBundle');
    setCanPresent(hasBundle);
  }, []);

  if (mode !== 'artist') return null;

  const navButtonStyle = {
    ...getFontStyle('artist', { selectedFont }),
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    borderRadius: '0.5rem',
    border: '1px solid #1e3a8a',
    backgroundColor: '#f3f4f6',
    color: '#1e3a8a',
    cursor: 'pointer',
    width: '160px',
    height: '42px',
    textAlign: 'center',
    boxSizing: 'border-box',
  };

  const rowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  };

  return (
    <>
      {/* Tier 1 + 2: Unified Container */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ ...rowStyle, marginBottom: '1rem' }}>
          {navButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView?.(key)}
              style={navButtonStyle}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={rowStyle}>
          <button
            onClick={onPreviewClient}
            style={{ ...navButtonStyle, backgroundColor: '#e0e7ff' }}
          >
            🎬 Preview Client
          </button>

          {canPresent && (
            <button
              onClick={() => setView('landing')}
              style={{ ...navButtonStyle, backgroundColor: '#dcfce7', color: '#166534' }}
            >
              🎯 Launch Client Mode
            </button>
          )}

          {showDevToggle && <DevToggle buttonStyle={navButtonStyle} />}
        </div>
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
              accept=".json, .zip"
              ref={fileInputRef}
              onChange={onImport}
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()} style={navButtonStyle}>
              📥 Import Gallery
            </button>
          </>
        )}

        {showExport && (
          <button onClick={onExport} style={navButtonStyle}>
            📤 Export Gallery
          </button>
        )}

        {onGenerate && (
          <button onClick={onGenerate} style={navButtonStyle}>
            🛠️ Generate Tags
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            style={{ ...navButtonStyle, backgroundColor: '#fee2e2', color: '#b91c1c' }}
          >
            🔄 Reset Dashboard
          </button>
        )}
      </div>
    </>
  );
}