// File: src/utils/ControlBar.jsx
import React, { useRef } from 'react';
import { useCuration } from '../YourCurationContext';
import DevToggle from '../DevToggle';
import { getFontStyle } from '../utils/fontUtils';
import { useFontSettings } from '../FontSettingsContext';

const navButtons = [
  { key: 'artist', label: 'Artist Dashboard' },
  { key: 'generate', label: 'Generate Tags' },
  { key: 'rate', label: 'Sample Rater' },
  { key: 'curated1', label: 'Gallery 1' },
  { key: 'curated2', label: 'Gallery 2' },
  { key: 'curatedFinal', label: 'Final Gallery' },
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
}) {
  const { mode } = useCuration();
  const { selectedFont } = useFontSettings();
  const fileInputRef = useRef();
  if (mode !== 'artist') return null;

  const baseStyle = {
    ...getFontStyle('artist', { selectedFont }),
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    borderRadius: '0.5rem',
    border: '1px solid #1e3a8a',
    cursor: 'pointer',
    width: '160px',
    minHeight: '42px',
    textAlign: 'center',
    boxSizing: 'border-box',
  };

  const getButtonStyle = (label) => {
    if (["Sample Rater", "Gallery 1", "Gallery 2", "Final Gallery"].includes(label)) {
      return { ...baseStyle, backgroundColor: '#eff6ff', color: '#1e3a8a' };
    }
    if (label === "Reset Dashboard") {
      return { ...baseStyle, backgroundColor: '#fef2f2', color: '#b91c1c' };
    }
    if (label === "Client Mode") {
      return { ...baseStyle, backgroundColor: '#ecfdf5', color: '#047857' };
    }
    if (["Artist Dashboard", "Generate Tags", "Import Gallery", "Export Gallery"].includes(label)) {
      return { ...baseStyle, backgroundColor: '#fffee8', color: '#92400e' };
    }
    return baseStyle;
  };

  const rowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ ...rowStyle, marginBottom: '1rem' }}>
          {navButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView?.(key)}
              style={getButtonStyle(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={rowStyle}>
          {showImport && (
            <>
              <input
                type="file"
                accept=".json, .zip"
                ref={fileInputRef}
                onChange={onImport}
                style={{ display: 'none' }}
              />
              <button onClick={() => fileInputRef.current?.click()} style={getButtonStyle("Import Gallery")}>
                Import Gallery
              </button>
            </>
          )}

          {showExport && (
            <button onClick={onExport} style={getButtonStyle("Export Gallery")}>
              Export Gallery
            </button>
          )}

          <button
            onClick={() => setView('landing')}
            style={getButtonStyle("Client Mode")}
          >
            Client Mode
          </button>

          {showDevToggle && <DevToggle buttonStyle={baseStyle} label="Dev Mode" />}

          {onReset && (
            <button
              onClick={onReset}
              style={getButtonStyle("Reset Dashboard")}
            >
              Reset Dashboard
            </button>
          )}
        </div>
      </div>
    </>
  );
}