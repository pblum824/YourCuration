// File: components/GalleryControls.jsx
import React from 'react';
import { controlButton } from './utils/styles';

export default function GalleryControls({
  onExport,
  onImport,
  onGenerate,
  onReset,
}) {
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