import React from 'react';

export default function GalleryControls({
  onExport,
  onImport,
  onGenerate,
  onReset,
  setView,
}) {
  const controlButton = {
    margin: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    color: '#1e3a8a',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={onExport} style={controlButton}>
          Export
        </button>
        <button
          onClick={onGenerate}
          style={{ ...controlButton, backgroundColor: '#e0f2fe' }}
        >
          Generate Tags →
        </button>
        <label style={{ ...controlButton, display: 'inline-block' }}>
          Import
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={onReset}
          style={{ ...controlButton, backgroundColor: '#fee2e2', color: '#b91c1c' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}