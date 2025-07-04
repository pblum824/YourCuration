// File: src/GallerySummary.jsx
import React from 'react';
import { getFontStyle } from './utils/fontUtils';
import { useFontSettings } from './FontSettingsContext';

export default function GallerySummary({ uploadCount, warnings }) {
  const { selectedFont } = useFontSettings();

  return (
    <div style={{ marginBottom: '2rem', textAlign: 'center', ...getFontStyle('artist', { selectedFont }) }}>
      {warnings.length > 0 && (
        <div style={{ color: '#b91c1c', marginBottom: '1rem' }}>
          <p>Some files were not added:</p>
          <ul>
            {warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
      <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
        {uploadCount === 0
          ? 'No files selected'
          : `${uploadCount} file${uploadCount > 1 ? 's' : ''} selected`}
      </span>
    </div>
  );
}